import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock de um serviço de usuário. Substitua pela sua implementação real.
const userService = {
  findUserByEmail: async (email: string) => {
    console.log(`Procurando usuário: ${email}`);
    // Simula não encontrar o usuário para permitir o registro
    return null;
  },
  createUser: async (userData: any) => {
    console.log('Criando novo usuário:', userData);
    const { password, ...user } = userData;
    return { id: 'new-user-id', ...user };
  },
};

/**
 * Registra um novo usuário com email e senha.
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça nome, email e senha.' });
  }

  try {
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Usuário com este email já existe.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await userService.createUser({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: 'Usuário registrado com sucesso!', user: newUser });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao registrar usuário.', error: error.message });
  }
};

/**
 * Realiza o login com email e senha.
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, forneça email e senha.' });
  }

  try {
    // Em um caso real, você buscaria o usuário e compararia a senha
    // const user = await userService.findUserByEmail(email);
    // const isMatch = await bcrypt.compare(password, user.password);

    // Mock para demonstração
    const user = { id: 'user-id-123', email, name: 'Usuário Logado' };
    if (!process.env.JWT_SECRET) {
      throw new Error('A variável de ambiente JWT_SECRET não está configurada.');
    }
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.json({ message: 'Login bem-sucedido!', token, user });
  } catch (error: any) {
    return res.status(500).json({ message: 'Erro ao fazer login.', error: error.message });
  }
};

/**
 * Callback para o login com Google.
 */
export const googleCallback = (req: Request, res: Response) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('A variável de ambiente JWT_SECRET não está configurada.');
    }
    const user = (req as any).user;
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Em um app real, você redirecionaria para o frontend com o token
    // Ex: res.redirect(`http://localhost:8081/login/success?token=${token}`);
    res.json({ message: 'Autenticação com Google bem-sucedida!', token, user });
  } catch (error: any) {
    res.status(500).json({ message: 'Erro na autenticação com Google.', error: error.message });
  }
};