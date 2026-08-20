import { Router } from 'express';
import { variationController } from '@/controllers/variation.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { variationCreateSchema, variationUpdateSchema } from '@/dtos/variation.dto';

const router = Router();
router.use(authGuard);

router.get('/', variationController.list);
router.get('/:id', variationController.getOne);
router.post('/', validateBody(variationCreateSchema), variationController.create);
router.patch('/:id', validateBody(variationUpdateSchema), variationController.update);
router.delete('/:id', variationController.remove);
router.get('/options/all', variationController.listOptions);
router.patch('/options/:optionId/translations', variationController.updateOptionTranslations);

export default router;
