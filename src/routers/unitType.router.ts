import { Router } from 'express';
import { unitTypeController } from '@/controllers/unitType.controller';
import { authGuard } from '@/middlewares/auth.middleware';

const router = Router();
router.use(authGuard);

router.get('/', unitTypeController.list);
router.post('/', unitTypeController.create);
router.patch('/:id', unitTypeController.update);
router.delete('/:id', unitTypeController.remove);
router.patch('/:id/translations', unitTypeController.updateTranslations);

export default router;
