import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import passport from 'passport';
import { logger } from './middlewares/logger';
import userRoutes from './modules/user/user.routes';
import propertyRoutes from './modules/property/property.routes';
import aiAnalysisRoutes from './modules/ai-analysis/ai-analysis.routes';
import authRoutes from './modules/auth/auth.routes';
import './modules/auth/passport'; // Importa a configuração do Passport.js
import relatorioRoutes from './modules/relatorio/relatorio.routes';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use(passport.initialize());

app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://10.50.0.54:4200',
    'https://front-end-show-rural26.vercel.app',
    /https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: '🌱 Sistema de Inventário de Propriedades Rurais',
    status: 'running',
    version: '2.0.0',
    escopo: 'Cadastro → Questionário → Satélite → Relatório',
    endpoints: {
      users: '/api/users',
      properties: '/api/properties',
      satellite: '/api/properties/satellite/*',
      ai_analysis: '/api/ai/*',
      auth: '/api/auth',
      relatorios: '/api/relatorios/*'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiAnalysisRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/relatorios', relatorioRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: err.message 
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Rota não encontrada' 
  });
});

// Apenas inicia o servidor se não estiver no ambiente serverless (Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 http://localhost:${PORT}`);
    console.log(`📱 http://10.50.0.54:${PORT}`);
  });
}

export default app;
