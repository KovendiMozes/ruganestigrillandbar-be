import { NextFunction, Request, Response } from 'express';
import { ingredientTypeService } from '@/services/ingredientType.service';

export const ingredientTypeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await ingredientTypeService.list()); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await ingredientTypeService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ingredientTypeService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await ingredientTypeService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async updateTranslations(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ingredientTypeService.updateTranslations(req.params.id, req.body.nameEn ?? '', req.body.nameRo ?? '')); } catch (e) { next(e); }
  },
};
