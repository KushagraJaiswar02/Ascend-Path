import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../modules/users/user.repository';
import { requireRole } from './rbac';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

interface JwtPayload {
  userId: string;
  role: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Not authorized, no token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      const user = await userRepository.findUserById(decoded.userId);

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      if (user.isBanned) {
        res.status(403);
        throw new Error('Your account has been permanently banned');
      }

      // Exclude passwordHash from user object
      const userObj = user.toObject();
      delete userObj.passwordHash;

      // Attach user to request object
      (req as any).user = userObj;

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await userRepository.findUserById(decoded.userId);

    if (user && !user.isBanned) {
      const userObj = user.toObject();
      delete userObj.passwordHash;
      (req as any).user = userObj;
    }
  } catch {
    // Public reads should remain public; protected handlers still use authMiddleware.
  }

  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      res.status(403);
      next(new Error(`Role: ${userRole} is not authorized to access this resource`));
      return;
    }
    
    next();
  };
};

export { requireRole };
