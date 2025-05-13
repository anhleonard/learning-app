import { forwardRef, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { AttendanceProcessor } from './queue.processor';
import { AttendancesModule } from 'src/attendances/attendances.module';

@Module({
  providers: [QueueService, AttendanceProcessor],
  exports: [QueueService],
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: 'attendance-queue' }),
    forwardRef(() => AttendancesModule),
  ],
})
export class QueueModule {}
