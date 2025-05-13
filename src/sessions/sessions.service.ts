import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSession(classId: number, createSessionDto: CreateSessionDto) {
    try {
      return await this.prismaService.session.create({
        data: {
          ...createSessionDto,
          class: { connect: { id: classId } },
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
