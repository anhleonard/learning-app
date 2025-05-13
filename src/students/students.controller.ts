import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Permission, Role } from 'src/utils/enums';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Permissions } from 'src/auth/decorators/permission.decorator';
import { UpdateStudentDto } from './dto/update-student.dto';
import { FilterStudentDto } from './dto/filter-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_STUDENT)
  @Post('/find-students')
  findStudents(@Body() filterStudentDto: FilterStudentDto) {
    return this.studentsService.findStudents(filterStudentDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_STUDENT)
  @Post('/find')
  findStudent(@Body('id') id: number) {
    return this.studentsService.findStudent(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_STUDENT)
  @Post('/create')
  createStudent(
    @Body() createStudentDto: CreateStudentDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.studentsService.createStudent(createStudentDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_STUDENT)
  @Post('/update')
  updateStudent(
    @Body() updateStudentDto: UpdateStudentDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.studentsService.updateStudent(updateStudentDto, user);
  }
}
