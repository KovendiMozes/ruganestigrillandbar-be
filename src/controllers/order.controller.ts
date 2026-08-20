import { Request, Response } from 'express';
import { z } from 'zod';
import { orderService, getOrdersVersion } from '@/services/order.service';

const createSchema = z.object({
  type: z.enum(['CARD', 'PACK', 'CASH', 'CASH_PACK']),
  totalRon: z.number().nonnegative(),
  lines: z.array(z.record(z.unknown())).default([]),
  note: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['ORDERED', 'READY', 'SERVED']),
});

const updateSchema = z.object({
  type: z.enum(['CARD', 'PACK', 'CASH', 'CASH_PACK']).optional(),
  totalRon: z.number().nonnegative().optional(),
  lines: z.array(z.record(z.unknown())).optional(),
  note: z.string().nullable().optional(),
});

export const orderController = {
  getVersion(_req: Request, res: Response) {
    res.json({ version: getOrdersVersion() });
  },

  async create(req: Request, res: Response) {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const order = await orderService.create(parsed.data.type, parsed.data.totalRon, parsed.data.lines as any, parsed.data.note);
    res.status(201).json(order);
  },

  async getStats(req: Request, res: Response) {
    const date = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date : undefined;
    res.json(await orderService.getStats(date));
  },

  async listActive(req: Request, res: Response) {
    const date = typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : undefined;
    res.json(await orderService.listActive(date));
  },

  async listToday(req: Request, res: Response) {
    res.json(await orderService.listToday());
  },

  async update(req: Request, res: Response) {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const order = await orderService.update(req.params.id, parsed.data as any);
    res.json(order);
  },

  async remove(req: Request, res: Response) {
    await orderService.remove(req.params.id);
    res.status(204).end();
  },

  async updateStatus(req: Request, res: Response) {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
    const order = await orderService.updateStatus(req.params.id, parsed.data.status);
    res.json(order);
  },
};
