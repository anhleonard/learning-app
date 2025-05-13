import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from 'src/utils/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    // Lấy user từ request
    const request = context.switchToHttp().getRequest<Request>();
    const user: any = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'You do not have permission to access this resource',
        requiredRoles,
        userRole: user?.role || 'none',
      });
    }

    return user && requiredRoles.includes(user.role);
  }
}
