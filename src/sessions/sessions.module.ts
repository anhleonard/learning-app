import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
  imports: [PrismaModule],
})
export class SessionsModule {}
