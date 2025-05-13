import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Permission } from 'src/utils/enums';

export class UpdateUserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  fullname: string;

  @IsArray()
  @IsOptional()
  permissions: Permission[];

  @IsBoolean()
  @IsOptional()
  locked: boolean;
}
