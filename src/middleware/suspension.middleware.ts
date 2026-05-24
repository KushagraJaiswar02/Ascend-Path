import { Request, Response, NextFunction } from 'express';

export const checkSuspended = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    res.status(401);
    return next(new Error('Authentication required'));
  }

  const isSuspended = user.isSuspended || (user.suspendedUntil && new Date(user.suspendedUntil) > new Date());

  if (isSuspended) {
    res.status(403);
    return next(new Error(user.suspensionReason || 'Your account is temporarily suspended. During suspension, you cannot post, ping, create sessions, or submit reports.'));
  }

  next();
};
