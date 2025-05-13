import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Worker, Job } from 'bullmq';
import { AttendancesService } from 'src/attendances/attendances.service';

@Processor('attendance-queue')
export class AttendanceProcessor extends WorkerHost {
  constructor(private readonly attendancesService: AttendancesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'createAttendance': {
        const { studentAttendance, createdBy } = job.data;
        // console.log('Processing data:', studentAttendance, createdBy);
        // Lưu vào DB
        await this.attendancesService.createAttendance(
          studentAttendance,
          createdBy,
        );
        break;
      }
    }
  }
}
