import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { TokenPayload } from 'src/auth/token-payload/token-payload.auth';
import { CreateAttendance } from 'src/utils/interfaces';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('attendance-queue') private attendanceQueue: Queue,
  ) {}

  async processAttendances(
    studentAttendances: CreateAttendance[],
    user: TokenPayload,
  ) {
    // Create jobs for attendance queue
    const attendanceJobs = studentAttendances.map((studentAttendance) => ({
      name: 'createAttendance',
      data: {
        studentAttendance,
        createdBy: user,
      },
    }));

    // Push all jobs into queue simultaneously
    await this.attendanceQueue.addBulk(attendanceJobs);
  }
}
