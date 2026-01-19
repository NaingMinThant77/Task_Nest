import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [// Allow 5 requests every 60 seconds
    UsersModule, TasksModule, RolesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {}
