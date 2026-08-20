import { NextFunction, Request, Response } from 'express';
import { HttpError } from '@/utils/httpError';
import { verifyJwt, JwtPayload } from '@/utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing or invalid Authorization header'));
  }
  const token = header.slice(7);
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}
