import { Injectable } from '@nestjs/common';
import { FilterHistoryDto } from './dto/filter-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from 'src/utils/enums';

@Injectable()
export class HistoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findHistories(filterHistoryDto: FilterHistoryDto) {
    const {
      classId,
      studentName,
      page = 1,
      rowPerPage = 10,
    } = filterHistoryDto;
    const skip = (page - 1) * rowPerPage;

    // Lấy danh sách học sinh
    const [students, totalStudents] = await Promise.all([
      this.prismaService.student.findMany({
        where: {
          name: studentName
            ? { contains: studentName, mode: 'insensitive' }
            : undefined,
          classes: classId ? { some: { classId: classId } } : undefined,
        },
        select: {
          id: true,
          name: true,
          classes: {
            select: {
              id: true,
              classId: true,
              createdAt: true,
              class: true,
            },
            orderBy: { createdAt: 'asc' }, // Sắp xếp theo thời gian vào lớp
          },
        },
        skip,
        take: rowPerPage,
      }),
      this.prismaService.student.count({
        where: {
          name: studentName
            ? { contains: studentName, mode: 'insensitive' }
            : undefined,
          classes: classId ? { some: { classId: classId } } : undefined,
        },
      }),
    ]);

    // Xử lý dữ liệu
    const studentData = await Promise.all(
      students.map(async (student) => {
        const classes = student.classes;
        const pastClasses = [];
        let currentClass = null;

        for (let i = 0; i < classes.length; i++) {
          const studentClass = classes[i];
          const nextClass = classes[i + 1]; // Lớp tiếp theo của học sinh
          const isCurrent = !nextClass; // Nếu không có lớp tiếp theo => đây là lớp hiện tại

          const endDate = nextClass ? nextClass.createdAt : new Date();

          // Tính số attendances trong khoảng thời gian học sinh ở lớp này
          const totalAttendances = await this.prismaService.attendance.count({
            where: {
              studentId: student.id,
              session: { classId: studentClass.class.id },
              createdAt: {
                gte: studentClass.createdAt,
                lt: endDate,
              },
              isAttend: true,
            },
          });

          const classData = {
            ...studentClass.class,
            totalAttendances,
          };

          if (isCurrent) {
            currentClass = classData;
          } else {
            pastClasses.push(classData);
          }
        }

        return {
          id: student.id,
          name: student.name,
          currentClass,
          pastClasses,
        };
      }),
    );

    return {
      total: totalStudents,
      data: studentData,
    };
  }
}
