import { Request, Response } from 'express';
import { settingService } from '@/services/setting.service';

export const settingController = {
  async getAll(req: Request, res: Response) {
    const settings = await settingService.getAll();
    res.json(settings);
  },

  async update(req: Request, res: Response) {
    const { key } = req.params;
    const { value } = req.body;
    if (typeof value !== 'string' && typeof value !== 'number') {
      res.status(400).json({ error: 'value required' });
      return;
    }
    await settingService.set(key, String(value));
    res.json({ key, value: String(value) });
  },
};
