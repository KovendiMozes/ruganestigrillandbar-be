import { Router } from 'express';
import { menuItemController } from '@/controllers/menuItem.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { menuItemCreateSchema, menuItemUpdateSchema } from '@/dtos/menuItem.dto';

const router = Router();
router.use(authGuard);

router.get('/', menuItemController.list);
router.get('/:id', menuItemController.getOne);
router.post('/', validateBody(menuItemCreateSchema), menuItemController.create);
router.patch('/:id', validateBody(menuItemUpdateSchema), menuItemController.update);
router.delete('/:id', menuItemController.remove);
router.patch('/:id/translations', menuItemController.updateTranslations);

export default router;
