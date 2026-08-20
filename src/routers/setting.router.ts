import { Router } from 'express';
import { settingController } from '@/controllers/setting.controller';

export const settingRouter = Router();
settingRouter.get('/', settingController.getAll);
settingRouter.put('/:key', settingController.update);
