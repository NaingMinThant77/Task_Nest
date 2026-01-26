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
  imports: [CacheModule.registerAsync({
      isGlobal: true, // This makes CACHE_MANAGER available in all modules
      useFactory: async () => {
  const store = await redisStore({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    },
    ttl: 600000, // 600000 = 10 minutes
    keyPrefix: '',  // 👈 remove "cache:"
  });

  // Add this to catch connection errors in your Docker logs
  store.client.on('error', (err) => console.error('Redis Client Error', err));
  store.client.on('connect', () => console.log('Successfully connected to Redis'));

  return { store };
},
    }),
    UsersModule, TasksModule, RolesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {}
