import { Request, Response } from 'express';
import aiAnalysisService from '../../services/ai-analysis.service';

class AIAnalysisController {
    /**
     * POST /api/ai/analyze
     * Analisa a imagem com um prompt personalizado
     * Body: { 
     *   "prompt": "seu prompt aqui",
     *   "inputs": {
     *     "areaTotal": 100,
     *     "coordenadas": [[-53.6, -24.78], ...],
     *     "usoSoloAtual": "pastagem",
     *     "historicoUso": "opcional",
     *     "dadosAdicionais": "opcional"
     *   }
     * }
     */
    async analyzeImage(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, inputs } = req.body;

            if (!prompt || typeof prompt !== 'string') {
                res.status(400).json({
                    error: 'Campo "prompt" é obrigatório e deve ser uma string',
                    exemplo: {
                        prompt: 'Você é um agrônomo especialista. Analise esta imagem de satélite...',
                        inputs: {
                            areaTotal: 100,
                            coordenadas: [[-53.6, -24.78], [-53.55, -24.78], [-53.55, -24.73], [-53.6, -24.73]],
                            usoSoloAtual: 'pastagem',
                            historicoUso: 'Área anteriormente utilizada para agricultura',
                            dadosAdicionais: 'Solo argiloso, clima subtropical'
                        }
                    }
                });
                return;
            }

            if (!inputs || typeof inputs !== 'object') {
                res.status(400).json({
                    error: 'Campo "inputs" é obrigatório e deve ser um objeto',
                    exemplo: {
                        areaTotal: 100,
                        coordenadas: [[-53.6, -24.78], [-53.55, -24.78]],
                        usoSoloAtual: 'pastagem'
                    }
                });
                return;
            }

            // Validar campos obrigatórios do inputs
            if (!inputs.areaTotal || typeof inputs.areaTotal !== 'number') {
                res.status(400).json({
                    error: 'Campo "inputs.areaTotal" é obrigatório e deve ser um número (hectares)'
                });
                return;
            }

            if (!Array.isArray(inputs.coordenadas) || inputs.coordenadas.length < 3) {
                res.status(400).json({
                    error: 'Campo "inputs.coordenadas" é obrigatório e deve ser um array com pelo menos 3 pontos'
                });
                return;
            }

            if (!inputs.usoSoloAtual || typeof inputs.usoSoloAtual !== 'string') {
                res.status(400).json({
                    error: 'Campo "inputs.usoSoloAtual" é obrigatório e deve ser uma string'
                });
                return;
            }

            console.log('🔍 Iniciando análise de imagem...');
            const result = await aiAnalysisService.analyzeImageWithCustomPrompt(prompt, inputs);

            res.status(200).json({
                success: true,
                data: result,
                mensagem: 'Análise concluída com sucesso'
            });
        } catch (error: any) {
            console.error('❌ Erro na análise:', error.message);
            res.status(500).json({
                error: 'Erro ao analisar imagem',
                detalhes: error.message
            });
        }
    }

    /**
     * POST /api/ai/report
     * Gera um relatório completo em Markdown
     * Body: { 
     *   "prompt": "seu prompt aqui",
     *   "inputs": { ... }
     * }
     */
    async generateReport(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, inputs } = req.body;

            if (!prompt || typeof prompt !== 'string') {
                res.status(400).json({
                    error: 'Campo "prompt" é obrigatório e deve ser uma string'
                });
                return;
            }

            if (!inputs || typeof inputs !== 'object') {
                res.status(400).json({
                    error: 'Campo "inputs" é obrigatório'
                });
                return;
            }

            console.log('📄 Gerando relatório...');
            const report = await aiAnalysisService.generateReport(prompt, inputs);

            res.status(200).json({
                success: true,
                relatorio: report,
                mensagem: 'Relatório gerado com sucesso'
            });
        } catch (error: any) {
            console.error('❌ Erro ao gerar relatório:', error.message);
            res.status(500).json({
                error: 'Erro ao gerar relatório',
                detalhes: error.message
            });
        }
    }

    /**
     * POST /api/ai/save-report
     * Salva o relatório em arquivo .md
     * Body: { 
     *   "prompt": "seu prompt aqui",
     *   "inputs": { ... }
     * }
     */
    async saveReport(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, inputs } = req.body;

            if (!prompt || typeof prompt !== 'string') {
                res.status(400).json({
                    error: 'Campo "prompt" é obrigatório e deve ser uma string'
                });
                return;
            }

            if (!inputs || typeof inputs !== 'object') {
                res.status(400).json({
                    error: 'Campo "inputs" é obrigatório'
                });
                return;
            }

            console.log('💾 Salvando relatório...');
            const { reportPath, analysis } = await aiAnalysisService.saveReport(prompt, inputs);

            res.status(200).json({
                success: true,
                arquivo_salvo: reportPath,
                data: analysis,
                mensagem: 'Relatório salvo com sucesso'
            });
        } catch (error: any) {
            console.error('❌ Erro ao salvar relatório:', error.message);
            res.status(500).json({
                error: 'Erro ao salvar relatório',
                detalhes: error.message
            });
        }
    }
}

export default new AIAnalysisController();
