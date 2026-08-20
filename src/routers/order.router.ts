import { Router } from 'express';
import { orderController } from '@/controllers/order.controller';

export const orderRouter = Router();
orderRouter.get('/version', orderController.getVersion);
orderRouter.get('/stats', orderController.getStats);
orderRouter.get('/active', orderController.listActive);
orderRouter.get('/today', orderController.listToday);
orderRouter.post('/', orderController.create);
orderRouter.patch('/:id/status', orderController.updateStatus);
orderRouter.patch('/:id', orderController.update);
orderRouter.delete('/:id', orderController.remove);
