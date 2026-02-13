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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Inicializa o Passport para autenticação
app.use(passport.initialize());

// Permite requisições de qualquer origem
// Para desenvolvimento, isso é aceitável.
// Para produção, restrinja a origem.
app.use(cors());

// Exemplo de configuração mais restrita para produção:
// app.use(cors({
//   origin: 'http://localhost:8081' // Permite apenas requisições do seu frontend
// }));

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
      auth: '/api/auth'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiAnalysisRoutes);
app.use('/api/auth', authRoutes);

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

app.listen(PORT, () => {
  console.log(`📡 http://localhost:${PORT}`);
});

export default app;
