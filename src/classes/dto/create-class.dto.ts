import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CreateSessionDto } from 'src/sessions/dto/create-session.dto';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsNotEmpty()
  sessions: CreateSessionDto[];
}
