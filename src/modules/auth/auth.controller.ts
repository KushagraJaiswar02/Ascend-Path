import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Cookie options for cross-origin deployment (Vercel frontend → Render backend).
 *
 * CRITICAL: sameSite MUST be 'none' (not 'strict' or 'lax') for cross-origin
 * requests. 'strict' silently blocks all cookies when the frontend and backend
 * are on different domains — the single most common deployment auth failure.
 *
 * sameSite: 'none' requires secure: true — browsers enforce this pair.
 * In local development (HTTP) we fall back to 'lax' so cookies still work.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user },
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        res.status(400);
      }
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, accessToken, refreshToken } = await authService.login(req.body);

      // Set Refresh Token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken,
        },
      });
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        res.status(401);
      }
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        res.status(401);
        throw new Error('Refresh token not found');
      }

      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(refreshToken);

      // Set new Refresh Token in HTTP-only cookie
      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
        },
      });
    } catch (error: any) {
      res.status(401);
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;

      await authService.logout(refreshToken);

      res.clearCookie('refreshToken', {
        ...COOKIE_OPTIONS,
        maxAge: 0,
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: (req as any).user,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
