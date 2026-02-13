import { Router } from 'express';
import aiAnalysisController from './ai-analysis.controller';

const router = Router();

/**
 * POST /api/ai/analyze
 * Analisa a imagem src/assets/image.png com prompt personalizado
 * Body: { "prompt": "seu prompt aqui" }
 */
router.post('/analyze', aiAnalysisController.analyzeImage);

/**
 * POST /api/ai/report
 * Gera relatório em Markdown da análise
 * Body: { "prompt": "seu prompt aqui", "userId": "abc123" }
 */
router.post('/report', aiAnalysisController.generateReport);

/**
 * POST /api/ai/save-report
 * Salva relatório em arquivo .md na pasta reports/
 * Body: { "prompt": "seu prompt aqui", "userId": "abc123" }
 */
router.post('/save-report', aiAnalysisController.saveReport);

/**
 * POST /api/ai/inventory
 * Fluxo completo: Análise de imagem + Respostas do produtor → Inventário de Carbono
 * Body: { "userId": "abc123" }
 */
router.post('/inventory', aiAnalysisController.generateInventory);

export default router;
