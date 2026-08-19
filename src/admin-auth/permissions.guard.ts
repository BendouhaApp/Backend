import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  ROLES_KEY,
  RequirePermissions,
  RequireRole,
} from './require-permissions.decorator';

export { PERMISSIONS_KEY, ROLES_KEY, RequirePermissions, RequireRole };

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  roleId?: number;
  permissions: string[];
  tokenVersion: number;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required on this endpoint
    }

    const request = context.switchToHttp().getRequest();
    const user: AdminUser = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException(
        'Access denied: Admin credentials or permissions not found',
      );
    }

    // Super Admin wildcard check (* or SUPER_ADMIN role bypasses all checks)
    if (
      user.role === 'SUPER_ADMIN' ||
      user.permissions.includes('*')
    ) {
      return true;
    }

    // Check if user has ALL required permissions for this action
    const hasAllPermissions = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(
        (p) => !user.permissions.includes(p),
      );
      throw new ForbiddenException(
        `Insufficient permissions. Missing: [${missingPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AdminUser = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Insufficient privileges');
    }

    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(' or ')}`,
      );
    }

    return true;
  }
}