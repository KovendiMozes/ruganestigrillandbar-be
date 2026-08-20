import { NextFunction, Request, Response } from 'express';
import { menuItemService } from '@/services/menuItem.service';
import { HttpError } from '@/utils/httpError';

export const menuItemController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await menuItemService.list()); } catch (e) { next(e); }
  },
  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await menuItemService.findById(req.params.id);
      if (!item) throw new HttpError(404, 'Not found');
      res.json(item);
    } catch (e) { next(e); }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await menuItemService.create(req.body)); } catch (e) { next(e); }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await menuItemService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try { await menuItemService.remove(req.params.id); res.status(204).end(); } catch (e) { next(e); }
  },
  async updateTranslations(req: Request, res: Response, next: NextFunction) {
    try {
      const { nameEn, nameRo } = req.body;
      res.json(await menuItemService.updateTranslations(req.params.id, nameEn ?? '', nameRo ?? ''));
    } catch (e) { next(e); }
  },
};
