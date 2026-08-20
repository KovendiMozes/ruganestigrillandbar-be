import { NextFunction, Request, Response } from 'express';
import { variationService } from '@/services/variation.service';
import { HttpError } from '@/utils/httpError';

export const variationController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await variationService.list()); } catch (e) { next(e); }
  },
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await variationService.findById(req.params.id);
      if (!v) throw new HttpError(404, 'Not found');
      res.json(v);
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await variationService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await variationService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await variationService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async listOptions(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await variationService.listOptions()); } catch (e) { next(e); }
  },
  async updateOptionTranslations(req: Request, res: Response, next: NextFunction) {
    try {
      const { nameEn, nameRo } = req.body;
      res.json(await variationService.updateOptionTranslations(req.params.optionId, nameEn ?? '', nameRo ?? ''));
    } catch (e) { next(e); }
  },
};
