import { Router } from 'express';
import { ingredientTypeController } from '@/controllers/ingredientType.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { ingredientTypeCreateSchema, ingredientTypeUpdateSchema } from '@/dtos/ingredientType.dto';

const router = Router();
router.use(authGuard);

router.get('/', ingredientTypeController.list);
router.post('/', validateBody(ingredientTypeCreateSchema), ingredientTypeController.create);
router.patch('/:id', validateBody(ingredientTypeUpdateSchema), ingredientTypeController.update);
router.delete('/:id', ingredientTypeController.remove);
router.patch('/:id/translations', ingredientTypeController.updateTranslations);

export default router;
