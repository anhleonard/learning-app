import { IsBoolean, IsNumber, IsOptional, ValidateIf } from 'class-validator';

export class FilterAttendanceDto {
  @IsOptional()
  @IsNumber()
  paymentId: number;

  @IsOptional()
  @IsBoolean()
  isAttend: boolean;

  @ValidateIf(
    (o) => o.learningYear !== undefined || o.learningMonth !== undefined,
  )
  @IsNumber()
  learningMonth?: number;

  @ValidateIf(
    (o) => o.learningMonth !== undefined || o.learningYear !== undefined,
  )
  @IsNumber()
  learningYear?: number;
}
