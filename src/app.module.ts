/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { RolesModule } from './roles/roles.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true, // This is crucial so AppService picks it up
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
          },
        });

        return {
          store: store as any, // Cast to any to avoid v5/v11 type conflicts
          ttl: 600000, // 10 minute
        };
      },
    }),
    UsersModule, TasksModule, RolesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {}
