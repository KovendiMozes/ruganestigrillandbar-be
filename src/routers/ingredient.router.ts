import { Router } from 'express';
import { ingredientController } from '@/controllers/ingredient.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { ingredientCreateSchema, ingredientUpdateSchema } from '@/dtos/ingredient.dto';

const router = Router();
router.use(authGuard);

router.get('/', ingredientController.list);
router.post('/', validateBody(ingredientCreateSchema), ingredientController.create);
router.patch('/:id', validateBody(ingredientUpdateSchema), ingredientController.update);
router.delete('/:id', ingredientController.remove);
router.patch('/:id/translations', ingredientController.updateTranslations);

export default router;
