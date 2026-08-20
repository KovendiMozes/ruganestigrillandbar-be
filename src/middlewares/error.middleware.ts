import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { HttpError } from '@/utils/httpError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message, code: err.code });
  }

  if (err instanceof Error && err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}
