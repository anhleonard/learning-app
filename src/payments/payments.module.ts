import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttendancesModule } from 'src/attendances/attendances.module';

@Module({
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
  imports: [PrismaModule, AttendancesModule],
})
export class PaymentsModule {}
