import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../../middleware/validation';
import { authMiddleware } from '../../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh', validate(refreshTokenSchema), authController.refresh.bind(authController));
router.get('/me', authMiddleware, authController.getMe.bind(authController));
router.post('/device-token', authMiddleware, authController.updateDeviceToken.bind(authController));
export default router;


