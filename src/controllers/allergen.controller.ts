import { NextFunction, Request, Response } from 'express';
import { allergenService } from '@/services/allergen.service';

export const allergenController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await allergenService.list()); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await allergenService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await allergenService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await allergenService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async updateTranslations(req: Request, res: Response, next: NextFunction) {
    try { res.json(await allergenService.updateTranslations(req.params.id, req.body.nameEn ?? '', req.body.nameRo ?? '')); } catch (e) { next(e); }
  },
};
