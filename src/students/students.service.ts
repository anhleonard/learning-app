import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(private readonly prismaService: PrismaService) { }
  
  async createStudent(createStudentDto: CreateStudentDto,  user: User) {
    try {
      return await this.prismaService.student.create({
        data: {
          ...createStudentDto,
          createdById: user.id
        }
      })
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
