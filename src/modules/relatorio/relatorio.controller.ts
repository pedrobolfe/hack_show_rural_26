import { Request, Response } from 'express';
import RelatorioModel from './relatorio.model';

class RelatorioController {
    /**
     * GET /api/relatorios/:id
     * Busca um relatório por ID
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (typeof id !== 'string') {
                res.status(400).json({
                    error: 'ID inválido'
                });
                return;
            }

            const relatorio = await RelatorioModel.findById(id);

            if (!relatorio) {
                res.status(404).json({
                    error: 'Relatório não encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: relatorio
            });
        } catch (error: any) {
            console.error('❌ Erro ao buscar relatório:', error.message);
            res.status(500).json({
                error: 'Erro ao buscar relatório',
                detalhes: error.message
            });
        }
    }

    /**
     * GET /api/relatorios/usuario/:userId
     * Busca todos os relatórios de um usuário
     */
    async getByUserId(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit as string) || 10;

            if (typeof userId !== 'string') {
                res.status(400).json({
                    error: 'userId inválido'
                });
                return;
            }

            const relatorios = await RelatorioModel.findByUserId(userId, limit);

            res.status(200).json({
                success: true,
                count: relatorios.length,
                data: relatorios
            });
        } catch (error: any) {
            console.error('❌ Erro ao buscar relatórios:', error.message);
            res.status(500).json({
                error: 'Erro ao buscar relatórios',
                detalhes: error.message
            });
        }
    }

    /**
     * GET /api/relatorios
     * Busca todos os relatórios (com limite)
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;

            const relatorios = await RelatorioModel.findAll(limit);

            res.status(200).json({
                success: true,
                count: relatorios.length,
                data: relatorios
            });
        } catch (error: any) {
            console.error('❌ Erro ao buscar relatórios:', error.message);
            res.status(500).json({
                error: 'Erro ao buscar relatórios',
                detalhes: error.message
            });
        }
    }
}

export default new RelatorioController();
