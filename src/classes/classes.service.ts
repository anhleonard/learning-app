import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionsService } from 'src/sessions/sessions.service';
import { UpdateClassDto } from './dto/update-class.dto';
import { FilterClassDto } from './dto/filter-class.dto';
import { Prisma } from '@prisma/client';
import { SessionKey, SessionStatus } from 'src/utils/enums';

@Injectable()
export class ClassesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly sessionsService: SessionsService,
  ) {}

  async findClass(id: number) {
    try {
      return await this.prismaService.class.findFirst({
        where: {
          id,
        },
        include: {
          sessions: {
            where: {
              status: SessionStatus.ACTIVE,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createClass(createClassDto: CreateClassDto, user: TokenPayload) {
    const { sessions, ...rest } = createClassDto;
    try {
      const createdClass = await this.prismaService.class.create({
        data: {
          ...rest,
          createdBy: { connect: { id: user.userId } },
        },
      });
      let createdNewSessions = [];
      if (sessions.length > 0 && createdClass) {
        for (const session of sessions) {
          const createdSession = await this.sessionsService.createSession(
            createdClass.id,
            session,
          );
          createdNewSessions.push(createdSession);
        }
      }
      return {
        ...createdClass,
        sessions: createdNewSessions,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateClass(updateClassDto: UpdateClassDto) {
    const { id: classId, sessions, ...rest } = updateClassDto;

    try {
      const updatedClass = await this.prismaService.class.update({
        where: { id: classId },
        data: { ...rest },
      });

      // Chỉ lấy danh sách sessions đang ACTIVE của class
      const activeSessions = await this.prismaService.session.findMany({
        where: { classId, status: 'ACTIVE' },
      });

      // Tạo map để tra cứu nhanh các session hiện tại theo sessionKey
      const activeSessionsMap = new Map(
        activeSessions.map((s) => [s.sessionKey, s]),
      );

      const newSessionKeys = sessions.map((s) => s.sessionKey);

      let createdNewSessions = [];
      let unchangedSessions = [];
      let sessionsToClose = [];

      for (const session of sessions) {
        const existingSession = activeSessionsMap.get(session.sessionKey);

        if (existingSession) {
          // Nếu session không thay đổi thì giữ nguyên
          if (
            existingSession.startTime === session.startTime &&
            existingSession.endTime === session.endTime &&
            existingSession.amount === session.amount
          ) {
            unchangedSessions.push(existingSession);
            continue;
          }

          // Nếu có thay đổi, đánh dấu session này cần đóng
          sessionsToClose.push(existingSession.id);
        }

        // Tạo session mới
        const createdSession = await this.sessionsService.createSession(
          classId,
          session,
        );
        createdNewSessions.push(createdSession);
      }

      // Đóng các session cũ không có trong danh sách mới
      const sessionsToCloseIds = activeSessions
        .filter((s) => !newSessionKeys.includes(s.sessionKey as SessionKey))
        .map((s) => s.id);

      const allSessionsToClose = [...sessionsToClose, ...sessionsToCloseIds];

      if (allSessionsToClose.length > 0) {
        await this.prismaService.session.updateMany({
          where: { id: { in: allSessionsToClose } },
          data: { status: 'CLOSED' },
        });
      }

      return {
        ...updatedClass,
        sessions: [...unchangedSessions, ...createdNewSessions],
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findClasses(filterClassDto: FilterClassDto) {
    try {
      const {
        name,
        status,
        page = 1,
        rowPerPage = 10,
        learningDate,
      } = filterClassDto;

      const sessionKeys = [
        SessionKey.SESSION_7, // Chủ nhật (0)
        SessionKey.SESSION_1, // Thứ 2 (1)
        SessionKey.SESSION_2, // Thứ 3 (2)
        SessionKey.SESSION_3, // Thứ 4 (3)
        SessionKey.SESSION_4, // Thứ 5 (4)
        SessionKey.SESSION_5, // Thứ 6 (5)
        SessionKey.SESSION_6, // Thứ 7 (6)
      ];

      const definedStatus = learningDate
        ? sessionKeys[new Date(learningDate).getDay()]
        : undefined;

      const whereCondition: Prisma.ClassWhereInput = {
        name: name ? { contains: name, mode: 'insensitive' } : undefined,
        status: status || undefined,
        ...(definedStatus
          ? {
              sessions: {
                some: {
                  sessionKey: definedStatus,
                  status: 'ACTIVE',
                },
              },
            }
          : {}),
      };

      const [data, total] = await Promise.all([
        this.prismaService.class.findMany({
          where: whereCondition,
          skip: (page - 1) * rowPerPage,
          take: rowPerPage,
          include: {
            sessions: {
              where: {
                sessionKey: definedStatus,
                status: 'ACTIVE',
              },
              include: learningDate
                ? {
                    attendances: {
                      where: {
                        createdAt: {
                          gte: new Date(learningDate.setHours(0, 0, 0, 0)), // Đầu ngày
                          lt: new Date(learningDate.setHours(23, 59, 59, 999)), // Cuối ngày
                        },
                      },
                    },
                  }
                : {},
            },
          },
        }),
        this.prismaService.class.count({ where: whereCondition }),
      ]);

      return {
        total,
        data,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
