import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAttendanceDto {
  @IsNumber()
  @IsNotEmpty()
  attendanceId: number;

  @IsBoolean()
  @IsNotEmpty()
  isAttend: boolean;

  @IsString()
  @IsNotEmpty()
  noteAttendance: string;
}
