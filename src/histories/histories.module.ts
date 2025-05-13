import { Module } from '@nestjs/common';
import { HistoriesController } from './histories.controller';
import { HistoriesService } from './histories.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [HistoriesController],
  providers: [HistoriesService],
  imports: [PrismaModule],
})
export class HistoriesModule {}
