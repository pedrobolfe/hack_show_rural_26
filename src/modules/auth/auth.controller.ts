import { Request, Response } from 'express';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const authController = {
  // Registrar novo usuário
  async register(req: Request, res: Response) {
    try {
      const { email, password, name, phone, numCRA } = req.body;

      // Validações
      if (!email || !password || !name || !numCRA) {
        return res.status(400).json({
          success: false,
          message: 'Email, senha, nome e número do CAR são obrigatórios'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter no mínimo 6 caracteres'
        });
      }

      // Criar usuário no Firebase Auth
      const userRecord = await getAuth().createUser({
        email,
        password,
        displayName: name
      });

      // Criar documento do usuário no Firestore
      const userData = {
        name,
        email,
        phone: phone || '',
        role: 'user',
        userType: 'produtor',
        numCRA,
        questionsAndResponses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      // Gerar custom token
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        token: customToken,
        user: {
          id: userRecord.uid,
          ...userData
        }
      });
    } catch (error: any) {
      console.error('Erro ao registrar usuário:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error.message
      });
    }
  },

  // Login
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário pelo email no Firebase Auth
      const userRecord = await getAuth().getUserByEmail(email);

      // Buscar dados do usuário no Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Gerar custom token
      const customToken = await getAuth().createCustomToken(userRecord.uid);

      const userData = userDoc.data();

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        token: customToken,
        user: {
          id: userRecord.uid,
          ...userData
        }
      });
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao fazer login',
        error: error.message
      });
    }
  },

  // Logout
  async logout(req: Request, res: Response) {
    try {
      // No Firebase, o logout é feito no cliente
      // Aqui podemos invalidar o token se necessário
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao fazer logout',
        error: error.message
      });
    }
  },

  // Refresh Token
  async refreshToken(req: Request, res: Response) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'UID do usuário é obrigatório'
        });
      }

      // Gerar novo custom token
      const customToken = await getAuth().createCustomToken(uid);

      res.json({
        success: true,
        token: customToken
      });
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao renovar token',
        error: error.message
      });
    }
  }
};
