import { NextFunction, Request, Response } from 'express';
import { ingredientService } from '@/services/ingredient.service';

export const ingredientController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await ingredientService.list()); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await ingredientService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ingredientService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await ingredientService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async updateTranslations(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ingredientService.updateTranslations(req.params.id, req.body.nameEn ?? '', req.body.nameRo ?? '')); } catch (e) { next(e); }
  },
};
