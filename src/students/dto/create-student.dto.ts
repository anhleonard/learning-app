import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(() => Date)
  @IsNotEmpty()
  dob: Date;

  @IsString()
  @IsNotEmpty()
  parent: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  secondPhoneNumber: string;
}
