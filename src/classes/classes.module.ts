import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
  imports: [PrismaModule, SessionsModule],
})
export class ClassesModule {}
