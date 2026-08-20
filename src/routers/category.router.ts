import { Router } from 'express';
import { categoryController } from '@/controllers/category.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { categoryCreateSchema, categoryUpdateSchema } from '@/dtos/category.dto';

const router = Router();
router.use(authGuard);

router.get('/', categoryController.list);
router.post('/', validateBody(categoryCreateSchema), categoryController.create);
router.patch('/:id', validateBody(categoryUpdateSchema), categoryController.update);
router.delete('/:id', categoryController.remove);
router.patch('/:id/translations', categoryController.updateTranslations);

export default router;
