import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendancesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAttendance(
    createAttendanceDto: CreateAttendanceDto,
    user: TokenPayload,
  ) {
    try {
      const { studentId, sessionId, ...rest } = createAttendanceDto;

      const foundSession = await this.prismaService.session.findFirst({
        where: {
          id: sessionId,
        },
        include: {
          class: true,
        },
      });

      if (!foundSession || !foundSession.class) {
        throw new NotFoundException('No related session or class found');
      }

      const classId = foundSession.class.id;

      const studentClass = await this.prismaService.studentClass.findFirst({
        where: {
          studentId: studentId,
          classId: classId,
          status: 'ACTIVE',
        },
        include: {
          student: true,
        },
      });

      if (!studentClass) {
        throw new BadRequestException(
          'The student does not belong to this class',
        );
      }

      //sau khi từ session tìm ra lớp và xác nhận student thuộc class đó thì tạo attendance
      const createdAttendance = await this.prismaService.attendance.create({
        data: {
          ...rest,
          createdBy: { connect: { id: user.userId } },
          session: { connect: { id: sessionId } },
          student: { connect: { id: studentId } },
        },
      });

      // TASK: update payment based on attendance //

      const { isAttend, createdAt } = createdAttendance;

      // Nếu học sinh không tham gia, không cập nhật payment
      if (!isAttend) return createdAttendance;

      // Xác định tháng và năm của buổi học
      const attendanceMonth = new Date(createdAt).getMonth() + 1;
      const attendanceYear = new Date(createdAt).getFullYear();

      // Lấy Payment hiện tại của tháng
      let payment = await this.prismaService.payment.findFirst({
        where: {
          studentId,
          createdAt: {
            gte: new Date(attendanceYear, attendanceMonth - 1, 1), // Ngày đầu tháng
            lt: new Date(attendanceYear, attendanceMonth, 1), // Ngày đầu tháng sau
          },
        },
      });

      if (!payment) {
        // Nếu chưa có Payment, tạo mới
        payment = await this.prismaService.payment.create({
          data: {
            totalSessions: 1,
            totalMonthAmount: foundSession.amount,
            totalPayment: foundSession.amount + studentClass.student.debt,
            status: 'SAVED',
            student: { connect: { id: studentId } },
          },
        });
      } else {
        // Nếu đã có Payment, chỉ cộng thêm buổi học mới và số tiền mới
        payment = await this.prismaService.payment.update({
          where: { id: payment.id },
          data: {
            totalSessions: { increment: 1 }, // Cộng thêm 1 buổi học
            totalMonthAmount: { increment: foundSession.amount }, // Cộng thêm tiền buổi học mới
            totalPayment: {
              increment: foundSession.amount, // Cộng dồn vào tổng tiền cần thanh toán, chỗ này do cộng dồn với payment nên không có debt ở đây
            },
          },
        });
      }

      // Cập nhật attendance với paymentId
      await this.prismaService.attendance.update({
        where: { id: createdAttendance.id },
        data: { payment: { connect: { id: payment.id } } },
      });

      return {
        createdAttendance,
        payment: payment ?? 'No payment updated',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateAttendance(
    updateAttendanceDto: UpdateAttendanceDto,
    user: TokenPayload,
  ) {
    const { attendanceId, ...rest } = updateAttendanceDto;

    const foundAttendance = await this.prismaService.attendance.findFirst({
      where: {
        id: attendanceId,
      },
      include: {
        session: true,
      },
    });

    if (!foundAttendance) {
      throw new NotFoundException('Attendance not found');
    }

    if (rest.isAttend === foundAttendance.isAttend) {
      return rest.noteAttendance !== foundAttendance.noteAttendance
        ? await this.prismaService.attendance.update({
            where: { id: attendanceId },
            data: {
              noteAttendance: rest.noteAttendance,
              updatedBy: { connect: { id: user.userId } },
            },
          })
        : {
            message: 'Nothing to update',
          };
    }

    // no permission to update for previous months
    const createdAt = new Date(foundAttendance.createdAt);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    if (
      createdAt.getMonth() !== currentMonth ||
      createdAt.getFullYear() !== currentYear
    ) {
      throw new BadRequestException(
        'Cannot update attendance from previous months',
      );
    }

    const { studentId } = foundAttendance;

    // Get Payment of current month
    const payment = await this.prismaService.payment.findFirst({
      where: {
        studentId,
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const isCurrentlyAttend = foundAttendance.isAttend;

    if (isCurrentlyAttend && !rest.isAttend) {
      // Nếu học sinh đang được điểm danh mà cập nhật lại là nghỉ => Trừ tiền
      await this.prismaService.payment.update({
        where: { id: payment.id },
        data: {
          totalSessions: payment.totalSessions - 1,
          totalMonthAmount:
            payment.totalMonthAmount - foundAttendance.session.amount,
          totalPayment: payment.totalPayment - foundAttendance.session.amount,
        },
      });
    }

    if (!isCurrentlyAttend && rest.isAttend) {
      // Nếu học sinh chưa được điểm danh mà cập nhật là đi học => Cộng tiền
      await this.prismaService.payment.update({
        where: { id: payment.id },
        data: {
          totalSessions: payment.totalSessions + 1,
          totalMonthAmount:
            payment.totalMonthAmount + foundAttendance.session.amount,
          totalPayment: payment.totalPayment + foundAttendance.session.amount,
        },
      });
    }

    // Cập nhật lại trạng thái của Attendance
    return await this.prismaService.attendance.update({
      where: { id: attendanceId },
      data: {
        isAttend: rest.isAttend,
        noteAttendance: rest.noteAttendance,
        updatedBy: { connect: { id: user.userId } },
      },
    });
  }

  async findAttendances(filterAttendanceDto: FilterAttendanceDto) {
    const { paymentId, isAttend, learningMonth, learningYear } =
      filterAttendanceDto;

    const whereCondition: Prisma.AttendanceWhereInput = {
      paymentId: paymentId || undefined,
      isAttend: isAttend || undefined,
      createdAt:
        learningMonth !== undefined && learningYear !== undefined
          ? {
              gte: new Date(learningYear, learningMonth - 1, 1), // Ngày đầu tháng
              lt: new Date(learningYear, learningMonth, 1), // Ngày đầu tháng tiếp theo
            }
          : undefined,
    };

    const attendances = await this.prismaService.attendance.findMany({
      where: whereCondition,
    });

    return {
      total: attendances.length,
      data: attendances,
    };
  }
}
