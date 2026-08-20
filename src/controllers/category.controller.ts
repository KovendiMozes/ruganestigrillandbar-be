import { NextFunction, Request, Response } from 'express';
import { categoryService } from '@/services/category.service';

export const categoryController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await categoryService.list()); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await categoryService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await categoryService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await categoryService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async updateTranslations(req: Request, res: Response, next: NextFunction) {
    try { res.json(await categoryService.updateTranslations(req.params.id, req.body.nameEn ?? '', req.body.nameRo ?? '')); } catch (e) { next(e); }
  },
};
