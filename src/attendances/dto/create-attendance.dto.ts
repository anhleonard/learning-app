import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @IsNumber()
  @IsNotEmpty()
  sessionId: number;

  @IsBoolean()
  @IsNotEmpty()
  isAttend: boolean;

  @IsString()
  @IsNotEmpty()
  noteAttendance: string;
}
