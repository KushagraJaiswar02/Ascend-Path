import { NextFunction, Request, Response } from 'express';
import { Role } from '../modules/users/user.model';

export type Permission =
  | 'reports:read'
  | 'reports:write'
  | 'reports:bulk'
  | 'content:moderate'
  | 'users:moderate'
  | 'users:roles'
  | 'analytics:read'
  | 'audit:read'
  | 'mentor_applications:read'
  | 'mentor_applications:review';

const roleRank: Record<string, number> = {
  [Role.USER]: 10,
  [Role.EXPLORER]: 10,
  [Role.PATHFINDER]: 15,
  [Role.GUIDE]: 20,
  [Role.MODERATOR]: 30,
  [Role.SENTINEL]: 30,
  [Role.ADMIN]: 40,
  [Role.ARCHITECT]: 40,
  [Role.SUPER_ADMIN]: 50,
};

const rolePermissions: Record<string, Permission[]> = {
  [Role.USER]: [],
  [Role.EXPLORER]: [],
  [Role.PATHFINDER]: [],
  [Role.GUIDE]: [],
  [Role.MODERATOR]: ['reports:read', 'reports:write', 'content:moderate', 'users:moderate', 'mentor_applications:read', 'mentor_applications:review'],
  [Role.SENTINEL]: ['reports:read', 'reports:write', 'content:moderate', 'users:moderate', 'mentor_applications:read', 'mentor_applications:review'],
  [Role.ADMIN]: [
    'reports:read',
    'reports:write',
    'reports:bulk',
    'content:moderate',
    'users:moderate',
    'analytics:read',
    'audit:read',
    'mentor_applications:read',
    'mentor_applications:review',
  ],
  [Role.ARCHITECT]: [
    'reports:read',
    'reports:write',
    'reports:bulk',
    'content:moderate',
    'users:moderate',
    'users:roles',
    'analytics:read',
    'audit:read',
    'mentor_applications:read',
    'mentor_applications:review',
  ],
  [Role.SUPER_ADMIN]: [
    'reports:read',
    'reports:write',
    'reports:bulk',
    'content:moderate',
    'users:moderate',
    'users:roles',
    'analytics:read',
    'audit:read',
    'mentor_applications:read',
    'mentor_applications:review',
  ],
};

export const hasRoleAtLeast = (actualRole: string | undefined, requiredRole: Role) => {
  if (!actualRole) return false;
  return (roleRank[actualRole] || 0) >= (roleRank[requiredRole] || 0);
};

export const hasPermission = (actualRole: string | undefined, permission: Permission) => {
  if (!actualRole) return false;
  return (rolePermissions[actualRole] || []).includes(permission);
};

export const requireRole = (minimumRole: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!hasRoleAtLeast(userRole, minimumRole)) {
      res.status(403);
      next(new Error(`Role: ${userRole || 'anonymous'} is not authorized to access this resource`));
      return;
    }

    next();
  };
};

export const requirePermission = (...permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    const allowed = permissions.every((permission) => hasPermission(userRole, permission));

    if (!allowed) {
      res.status(403);
      next(new Error(`Role: ${userRole || 'anonymous'} lacks required permissions`));
      return;
    }

    next();
  };
};
