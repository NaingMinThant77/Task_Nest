/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager'
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheLoggingInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const key = `tasks_all:${JSON.stringify(request.query)}`; // Match your service key logic

    const cachedResponse = await this.cacheManager.get(key);
    
    if (cachedResponse) {
      console.log(`🚀 [REDIS] Cache Hit: ${request.url}`);
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(() => console.log(`– [DB] Database Hit: ${request.url}`))
    );
  }
}