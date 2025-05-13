import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class FilterPaymentDto {
  @IsString()
  @IsOptional()
  name: string; // the name of student

  @IsNumber()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsOptional()
  rowPerPage: number;

  @IsNumber()
  @IsOptional()
  classId: number;

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
