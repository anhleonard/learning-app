import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateStudentDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @IsString()
  @IsOptional()
  name: string;

  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @IsOptional()
  dob: Date;

  @IsString()
  @IsOptional()
  parent: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  secondPhoneNumber: string;
}
