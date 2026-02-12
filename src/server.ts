import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger';
import userRoutes from './modules/user/user.routes';
import propertyRoutes from './modules/property/property.routes';
import carbonCreditRoutes from './modules/carbon-credit/carbon-credit.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    message: 'EcoTrust Agropool API - Carbon Registry System',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      properties: '/api/properties',
      credits: '/api/credits',
      publicVerification: '/api/credits/verify/:tokenId'
    }
  });
});

app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/credits', carbonCreditRoutes);

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
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 http://localhost:${PORT}`);
});

export default app;
