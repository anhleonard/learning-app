import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/utils/enums';
import { HistoriesService } from './histories.service';
import { FilterHistoryDto } from './dto/filter-history.dto';

@Controller('histories')
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/find-histories')
  findHistories(@Body() filterHistoryDto: FilterHistoryDto) {
    return this.historiesService.findHistories(filterHistoryDto);
  }
}
