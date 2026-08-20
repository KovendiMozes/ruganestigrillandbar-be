import { NextFunction, Request, Response } from 'express';
import { unitTypeService } from '@/services/unitType.service';

export const unitTypeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await unitTypeService.list()); } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await unitTypeService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await unitTypeService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await unitTypeService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async updateTranslations(req: Request, res: Response, next: NextFunction) {
    try { res.json(await unitTypeService.updateTranslations(req.params.id, req.body.nameEn ?? '', req.body.nameRo ?? '')); } catch (e) { next(e); }
  },
};
