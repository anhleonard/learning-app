import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterHistoryDto {
  @IsOptional()
  @IsString()
  studentName: string;

  @IsNumber()
  @IsOptional()
  classId: number;

  @IsNumber()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsOptional()
  rowPerPage: number;
}
