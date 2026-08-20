import { NextFunction, Request, Response } from 'express';
import { authService } from '@/services/auth.service';
import { HttpError } from '@/utils/httpError';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new HttpError(401, 'Unauthorized');
      const user = await authService.me(req.user.userId);
      res.json(user);
    } catch (e) {
      next(e);
    }
  },
};
