/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get required roles from the decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no roles are defined, allow access
    if (!requiredRoles) return true;

    // 3. Get user from request (populated by JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}