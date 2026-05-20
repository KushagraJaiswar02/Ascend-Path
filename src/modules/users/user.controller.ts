import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { userRepository } from './user.repository';
import { registerUserSchema } from './user.validation';

export const userController = {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      // 1. Validate request body
      const validatedData = registerUserSchema.parse({ body: req.body });

      // 2. Call service layer
      const user = await userService.registerUser(validatedData.body);

      // 3. Send response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const user = await userService.getUserById(id);

      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  },

  async getGuides(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await userRepository.getGuides({}, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
