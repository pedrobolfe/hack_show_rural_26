import { Router } from 'express';
import relatorioController from './relatorio.controller';

const router = Router();

/**
 * GET /api/relatorios/:id
 * Busca um relatório específico por ID
 */
router.get('/:id', relatorioController.getById);

/**
 * GET /api/relatorios/usuario/:userId
 * Busca todos os relatórios de um usuário
 * Query params: ?limit=10
 */
router.get('/usuario/:userId', relatorioController.getByUserId);

/**
 * GET /api/relatorios
 * Busca todos os relatórios
 * Query params: ?limit=50
 */
router.get('/', relatorioController.getAll);

export default router;
