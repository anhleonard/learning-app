import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Status } from 'src/utils/enums';

export class FilterClassDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(Status)
  @IsOptional()
  status: Status;

  @IsNumber()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsOptional()
  rowPerPage: number;

  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @IsOptional()
  learningDate: Date;
}
