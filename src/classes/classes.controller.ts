import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/utils/enums';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { FilterClassDto } from './dto/filter-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/find')
  findStudent(@Body('id') id: number) {
    return this.classesService.findClass(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/create')
  createClass(
    @Body() createClassDto: CreateClassDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.classesService.createClass(createClassDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/update')
  updateClass(@Body() updateClassDto: UpdateClassDto) {
    return this.classesService.updateClass(updateClassDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/find-classes')
  findClasses(@Body() filterClassDto: FilterClassDto) {
    return this.classesService.findClasses(filterClassDto);
  }
}
