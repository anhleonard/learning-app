import {
  Body,
  Controller,
  ParseArrayPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Permissions } from 'src/auth/decorators/permission.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { Permission, Role } from 'src/utils/enums';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueueService } from 'src/queue/queue.service';
import { FilterAttendanceDto } from './dto/filter-attendance.dto';

@Controller('attendances')
export class AttendancesController {
  constructor(
    private readonly attendancesService: AttendancesService,
    private readonly queueService: QueueService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_ATTENDANCE)
  @Post('/create')
  createAttendance(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.attendancesService.createAttendance(createAttendanceDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_ATTENDANCE)
  @Post('/create-batch')
  createBatchAttendances(
    @Body(new ParseArrayPipe({ items: CreateAttendanceDto }))
    attendances: CreateAttendanceDto[],
    @CurrentUser() user: TokenPayload,
  ) {
    return this.queueService.processAttendances(attendances, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_ATTENDANCE)
  @Post('/update')
  updateAttendance(
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.attendancesService.updateAttendance(updateAttendanceDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.TA)
  @Permissions(Permission.CREATE_ATTENDANCE)
  @Post('/find-attendances')
  findAttendances(@Body() filterAttendanceDto: FilterAttendanceDto) {
    return this.attendancesService.findAttendances(filterAttendanceDto);
  }
}
