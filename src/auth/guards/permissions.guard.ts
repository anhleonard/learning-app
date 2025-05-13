import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Permission } from 'src/utils/enums';
import { Role } from 'src/utils/enums';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách quyền được yêu cầu từ metadata
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // Nếu không có quyền cụ thể nào được yêu cầu => Bỏ qua kiểm tra
    if (!requiredPermissions) {
      return true;
    }

    // Lấy thông tin user từ request
    const request = context.switchToHttp().getRequest<Request>();
    const user: any = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Nếu user có role là ADMIN hoặc GUEST => Bỏ qua kiểm tra permission
    if (user.role === Role.ADMIN || user.role === Role.GUEST) {
      return true;
    }

    // Nếu user có role là TA thì mới kiểm tra permission
    if (user.role === Role.TA) {
      const hasPermission = requiredPermissions.some((permission) =>
        user.permissions.includes(permission),
      );

      if (!hasPermission) {
        throw new ForbiddenException({
          statusCode: 403,
          message: 'You do not have permission to perform this action',
          requiredPermissions,
          userPermissions: user.permissions,
        });
      }
    }

    return true;
  }
}
