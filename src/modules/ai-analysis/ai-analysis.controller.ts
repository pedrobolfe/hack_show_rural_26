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

            // Se inputs não for fornecido, usar valores padrão
            const defaultInputs = {
                areaTotal: 100,
                coordenadas: [[-53.6, -24.78], [-53.55, -24.78], [-53.55, -24.73], [-53.6, -24.73], [-53.6, -24.78]],
                dataPlantio: 'Não informado',
                dataColheita: 'Não informado',
                classeTextural: 'Não informado',
                teorArgila: 0,
                usoAnterior: 'Não informado',
                sistemaCultivo: 'Não informado',
                tempoAdocao: 0,
                areaQueima: 0,
                areaManejoOrganico: 0,
                areaCultivada: 100,
                produtividadeMedia: 0,
                usoSoloAtual: 'não especificado',
                historicoUso: 'Não informado',
                dadosAdicionais: 'Análise baseada apenas na imagem de satélite'
            };

            const analysisInputs = inputs || defaultInputs;

            // Validar apenas se inputs foi fornecido
            if (inputs) {
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
            }

            console.log('🔍 Iniciando análise de imagem...');
            const result = await aiAnalysisService.analyzeImageWithCustomPrompt(prompt, analysisInputs);

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
     * Gera um relatório completo em Markdown e salva no banco
     * Body: { 
     *   "prompt": "seu prompt aqui",
     *   "inputs": { ... }, // opcional
     *   "userId": "id_do_usuario" // obrigatório
     * }
     */
    async generateReport(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, inputs, userId } = req.body;

            if (!prompt || typeof prompt !== 'string') {
                res.status(400).json({
                    error: 'Campo "prompt" é obrigatório e deve ser uma string'
                });
                return;
            }

            if (!userId || typeof userId !== 'string') {
                res.status(400).json({
                    error: 'Campo "userId" é obrigatório e deve ser uma string'
                });
                return;
            }

            // Valores padrão para inputs
            const defaultInputs = {
                areaTotal: 100,
                coordenadas: [[-53.6, -24.78], [-53.55, -24.78], [-53.55, -24.73], [-53.6, -24.73], [-53.6, -24.78]],
                dataPlantio: 'Não informado',
                dataColheita: 'Não informado',
                classeTextural: 'Não informado',
                teorArgila: 0,
                usoAnterior: 'Não informado',
                sistemaCultivo: 'Não informado',
                tempoAdocao: 0,
                areaQueima: 0,
                areaManejoOrganico: 0,
                areaCultivada: 100,
                produtividadeMedia: 0,
                usoSoloAtual: 'não especificado',
                historicoUso: 'Não informado',
                dadosAdicionais: 'Análise baseada apenas na imagem de satélite'
            };

            const analysisInputs = inputs || defaultInputs;

            console.log('📄 Gerando relatório...');
            const { report, relatorioId } = await aiAnalysisService.generateReport(prompt, analysisInputs, userId);

            res.status(200).json({
                success: true,
                relatorioId,
                relatorio: report,
                mensagem: 'Relatório gerado e salvo com sucesso'
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
     * Salva o relatório em arquivo .md e no banco de dados
     * Body: { 
     *   "prompt": "seu prompt aqui",
     *   "inputs": { ... }, // opcional
     *   "userId": "id_do_usuario" // obrigatório
     * }
     */
    async saveReport(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, inputs, userId } = req.body;

            if (!prompt || typeof prompt !== 'string') {
                res.status(400).json({
                    error: 'Campo "prompt" é obrigatório e deve ser uma string'
                });
                return;
            }

            if (!userId || typeof userId !== 'string') {
                res.status(400).json({
                    error: 'Campo "userId" é obrigatório e deve ser uma string'
                });
                return;
            }

            // Valores padrão para inputs
            const defaultInputs = {
                areaTotal: 100,
                coordenadas: [[-53.6, -24.78], [-53.55, -24.78], [-53.55, -24.73], [-53.6, -24.73], [-53.6, -24.78]],
                dataPlantio: 'Não informado',
                dataColheita: 'Não informado',
                classeTextural: 'Não informado',
                teorArgila: 0,
                usoAnterior: 'Não informado',
                sistemaCultivo: 'Não informado',
                tempoAdocao: 0,
                areaQueima: 0,
                areaManejoOrganico: 0,
                areaCultivada: 100,
                produtividadeMedia: 0,
                usoSoloAtual: 'não especificado',
                historicoUso: 'Não informado',
                dadosAdicionais: 'Análise baseada apenas na imagem de satélite'
            };

            const analysisInputs = inputs || defaultInputs;

            console.log('💾 Salvando relatório...');
            const { reportPath, analysis, relatorioId } = await aiAnalysisService.saveReport(prompt, analysisInputs, userId);

            res.status(200).json({
                success: true,
                relatorioId,
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
