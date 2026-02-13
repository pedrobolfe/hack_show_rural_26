import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Rota para registrar com email e senha (Firebase)
router.post('/register', authController.register);

// Rota para logar com email e senha (Firebase)
router.post('/login', authController.login);

// Rota para logout
router.post('/logout', authController.logout);

// Rota para refresh token
router.post('/refresh-token', authController.refreshToken);

export default router;
