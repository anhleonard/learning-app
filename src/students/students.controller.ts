import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }
  
  @UseGuards(JwtAuthGuard)
  @Post('/create')
  createStudent(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: User) {
    return this.studentsService.createStudent(createStudentDto, user);
  }
}
