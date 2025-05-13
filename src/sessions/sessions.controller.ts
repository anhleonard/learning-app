import { Body, Controller, Post } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('/create')
  createSession(
    @Body() body: { classId: number; createSessionDto: CreateSessionDto },
  ) {
    const { classId, createSessionDto } = body;
    return this.sessionsService.createSession(classId, createSessionDto);
  }
}
