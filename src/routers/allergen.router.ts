import { Router } from 'express';
import { allergenController } from '@/controllers/allergen.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { allergenCreateSchema, allergenUpdateSchema } from '@/dtos/allergen.dto';

const router = Router();
router.use(authGuard);

router.get('/', allergenController.list);
router.post('/', validateBody(allergenCreateSchema), allergenController.create);
router.patch('/:id', validateBody(allergenUpdateSchema), allergenController.update);
router.delete('/:id', allergenController.remove);
router.patch('/:id/translations', allergenController.updateTranslations);

export default router;
