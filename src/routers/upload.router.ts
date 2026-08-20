import { Router } from 'express';
import { uploadController } from '@/controllers/upload.controller';
import { authGuard } from '@/middlewares/auth.middleware';
import { imageUpload } from '@/middlewares/upload.middleware';

const router = Router();

router.post('/image', authGuard, imageUpload.single('file'), uploadController.uploadImage);
router.delete('/image', authGuard, uploadController.deleteImage);

export default router;
