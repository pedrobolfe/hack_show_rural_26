import { Router } from 'express';
// @ts-ignore
import passport from 'passport'; 
// Note: If the error persists, run: npm install passport @types/passport
import * as authController from './auth.controller';

const router = Router();

// Rota para registrar com email e senha
router.post('/register', authController.register);

// Rota para logar com email e senha
router.post('/login', authController.login);

// Rota para iniciar a autenticação com Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Rota de callback que o Google chama após o login
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failure', session: false }),
  authController.googleCallback
);

export default router;