import { Router } from 'express';
import authRouter from './auth.router';
import uploadRouter from './upload.router';
import allergenRouter from './allergen.router';
import categoryRouter from './category.router';
import ingredientRouter from './ingredient.router';
import ingredientTypeRouter from './ingredientType.router';
import unitTypeRouter from './unitType.router';
import variationRouter from './variation.router';
import menuItemRouter from './menuItem.router';
import { settingRouter } from './setting.router';
import { orderRouter } from './order.router';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRouter);
router.use('/uploads', uploadRouter);
router.use('/categories', categoryRouter);
router.use('/allergens', allergenRouter);
router.use('/ingredients', ingredientRouter);
router.use('/ingredient-types', ingredientTypeRouter);
router.use('/unit-types', unitTypeRouter);
router.use('/variations', variationRouter);
router.use('/menu-items', menuItemRouter);
router.use('/settings', settingRouter);
router.use('/orders', orderRouter);

export default router;
