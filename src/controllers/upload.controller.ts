import { NextFunction, Request, Response } from 'express';
import { uploadService } from '@/services/upload.service';
import { HttpError } from '@/utils/httpError';

export const uploadController = {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new HttpError(400, 'No file provided (expected field "file")');
      const result = await uploadService.uploadImage(req.file);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  },

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, url } = req.body as { key?: string; url?: string };
      const resolvedKey = key ?? uploadService.keyFromUrl(url);
      if (!resolvedKey) throw new HttpError(400, 'Missing key or url');
      await uploadService.deleteImage(resolvedKey);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
};
