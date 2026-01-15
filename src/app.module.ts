import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [UsersModule, TasksModule, RolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
