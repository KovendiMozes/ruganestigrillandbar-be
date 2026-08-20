import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { validateBody } from '@/middlewares/validate.middleware';
import { loginSchema, registerSchema } from '@/dtos/auth.dto';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authGuard, authController.me);

export default router;
