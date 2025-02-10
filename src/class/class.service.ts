import { Injectable } from '@nestjs/common';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassService {
  async createClass(createClassDto: CreateClassDto) {}
}
