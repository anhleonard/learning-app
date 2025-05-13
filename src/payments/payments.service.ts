import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from 'src/utils/enums';
import { FilterPaymentDto } from './dto/filter-payment.dto';
import { Prisma } from '@prisma/client';
import { FindDetailPaymentDto } from './dto/find-detail-payment.dto';
import { AttendancesService } from 'src/attendances/attendances.service';
import { FilterAttendanceDto } from 'src/attendances/dto/filter-attendance.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly attendancesService: AttendancesService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto) {
    try {
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updatePayment(updatePaymentDto: UpdatePaymentDto) {
    try {
      const { paymentId, status, paidAmount, paymentNote } = updatePaymentDto;

      const foundPayment = await this.prismaService.payment.findFirst({
        where: {
          id: paymentId,
        },
      });

      if (!foundPayment) {
        throw new NotFoundException('Payment not found');
      }

      switch (status) {
        case PaymentStatus.SENT:
          return await this.prismaService.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              status: PaymentStatus.SENT,
              ...(paymentNote && {
                paymentNote: paymentNote,
              }),
            },
          });
        case PaymentStatus.PAID:
          // update debt of student
          await this.prismaService.student.update({
            where: {
              id: foundPayment.studentId,
            },
            data: {
              debt: foundPayment.totalPayment - paidAmount,
            },
          });
          // update payment with status and total paid
          return await this.prismaService.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              status: PaymentStatus.PAID,
              paidPayment: paidAmount,
            },
          });
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findPayments(filterPaymentDto: FilterPaymentDto) {
    try {
      const {
        name,
        page = 1,
        rowPerPage = 10,
        classId,
        learningMonth,
        learningYear,
      } = filterPaymentDto;

      const skip = (page - 1) * rowPerPage;
      const take = rowPerPage;

      const where: Prisma.PaymentWhereInput = {
        student: {
          name: name ? { contains: name, mode: 'insensitive' } : undefined,
          classes: classId
            ? {
                some: {
                  classId,
                },
              }
            : undefined,
        },
        createdAt:
          learningMonth && learningYear
            ? {
                gte: new Date(learningYear, learningMonth - 1, 1),
                lt: new Date(learningYear, learningMonth, 1),
              }
            : undefined,
      };

      const [payments, total] = await Promise.all([
        this.prismaService.payment.findMany({
          where,
          take,
          skip,
          include: {
            student: true,
          },
        }),
        this.prismaService.payment.count({ where }),
      ]);

      return {
        total,
        data: payments,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findDetailPayment(findDetailPaymentDto: FindDetailPaymentDto) {
    try {
      const { paymentId, learningMonth, learningYear } = findDetailPaymentDto;
      const foundPayment = await this.prismaService.payment.findFirst({
        where: {
          id: paymentId,
        },
      });

      if (learningMonth && learningYear) {
        const filters: FilterAttendanceDto = {
          paymentId,
          isAttend: true,
          learningMonth,
          learningYear,
        };
        const foundAttendances =
          await this.attendancesService.findAttendances(filters);
        return {
          ...foundPayment,
          attendances: foundAttendances,
        };
      } else return foundPayment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
