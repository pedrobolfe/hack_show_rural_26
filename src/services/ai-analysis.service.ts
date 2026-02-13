import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';
import RelatorioModel from '../modules/relatorio/relatorio.model';

interface CoordenadasData {
    [key: string]: {
        area: string;
        centroide: [number, number];
        [key: `pos${number}`]: {
            lat: number;
            lon: number;
        };
    };
}

interface AnalysisInput {
    areaTotal: number; // hectares
    coordenadas: Array<[number, number]>; // [[lng, lat], ...]
    dataPlantio?: string; // data de plantio
    dataColheita?: string; // data de colheita
    classeTextural?: string; // classe textural do solo
    teorArgila?: number; // teor de argila no solo (%)
    usoAnterior?: string; // uso anterior da terra
    sistemaCultivo?: string; // sistema de cultivo atual
    tempoAdocao?: number; // tempo de adoção do sistema (anos)
    areaQueima?: number; // área de queima de resíduos da cultura (ha)
    areaManejoOrganico?: number; // área de manejo de solos orgânicos (ha)
    areaCultivada?: number; // área cultivada (ha)
    produtividadeMedia?: number; // produtividade média
    // Campos antigos mantidos para compatibilidade
    usoSoloAtual?: string; // ex: pastagem, floresta nativa, agricultura, área degradada
    historicoUso?: string; // opcional
    dadosAdicionais?: string; // opcional
}

interface AnalysisResult {
    prompt_utilizado: string;
    resposta_completa: string;
    timestamp: string;
}

class AIAnalysisService {
    private gemini: GoogleGenerativeAI | null = null;

    private getGemini(): GoogleGenerativeAI {
        if (!this.gemini) {
            const key = process.env.GEMINI_API_KEY;
            if (!key) {
                throw new Error('GEMINI_API_KEY não definida no .env');
            }
            this.gemini = new GoogleGenerativeAI(key);
        }
        return this.gemini;
    }

    /**
     * Carrega dados de coordenadas do arquivo JSON
     */
    private async loadCoordenadasData(): Promise<CoordenadasData | null> {
        try {
            const coordenadasPath = path.join(__dirname, 'coordenadas.json');
            const data = await fs.readFile(coordenadasPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.log('⚠️ Arquivo coordenadas.json não encontrado, usando dados fornecidos');
            return null;
        }
    }

    /**
     * Extrai área em hectares do formato "5,9 ha"
     */
    private parseArea(areaString: string): number {
        const match = areaString.match(/(\d+[,.]?\d*)/);
        if (match) {
            return parseFloat(match[1].replace(',', '.'));
        }
        return 0;
    }


    async analyzeImageWithCustomPrompt(customPrompt: string, inputs: AnalysisInput): Promise<AnalysisResult> {

        const coordenadasData = await this.loadCoordenadasData();
        let areaTotal = inputs.areaTotal;
        let latitude = 0;
        let longitude = 0;

        if (coordenadasData) {
            const firstProperty = Object.values(coordenadasData)[0];
            if (firstProperty) {
                if (firstProperty.area) {
                    areaTotal = this.parseArea(firstProperty.area);
                }
                if (firstProperty.centroide) {
                    [latitude, longitude] = firstProperty.centroide;
                }
            }
        } else {
            [longitude, latitude] = inputs.coordenadas[0] || [0, 0];
        }

        const imagePath = path.join(__dirname, '..', 'assets', 'image.png');
        
        let imageBuffer: Buffer;
        try {
            imageBuffer = await fs.readFile(imagePath);
        } catch (error: any) {
            throw new Error(`Erro ao ler imagem: ${error.message}`);
        }

        const genAI = this.getGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/png' as const,
            },
        };

        const promptCompleto = `
        Você é um especialista em inventário de gases de efeito estufa (GEE), com base nas metodologias do IPCC (2006 Guidelines for National Greenhouse Gas Inventories), GHG Protocol e boas práticas de MRV.

Analise a imagem de satélite fornecida para a propriedade rural na seguinte localização:

Entradas fornecidas:
- Latitude: ${latitude}
- Longitude: ${longitude}
- Área total: ${areaTotal} hectares
- Imagem em anexo

Com base exclusivamente na análise da imagem de satélite e nos dados fornecidos, responda obrigatoriamente e exclusivamente no formato abaixo.

Não adicione explicações, comentários, análises extras ou qualquer texto adicional.
Não altere a ordem.
Não omita campos.
Não inclua títulos ou introduções.
Responda exatamente nos moldes abaixo:

1. Data de plantio:
2. Data de colheita:
3. Classe textural do solo:
4. Teor de argila no solo:
5. Uso anterior da terra:
6. Sistema de cultivo atual:
7. Tempo de adoção do sistema:
8. Área de queima de resíduos da cultura:
9. Área de manejo de solos orgânicos:
10. Área cultivada:
11. Tipo de plantio atual:
12. Produtividade média:
13. Tamanho de area de Mata:
14. Estimativa de carbono estocado na vegetação (toneladas de CO2 equivalente):
15. Estimativa de emissões de GEE (toneladas de CO2 equivalente):

Para cada item:
- Utilize inferência técnica baseada em práticas agronômicas conhecidas quando aplicável.`;

        try {
            // excedemos a consulta diaria
            // const result = await model.generateContent([promptCompleto, imagePart]);
            const responseText = "1. Data de plantio: Outubro/Novembro\n2. Data de colheita: Fevereiro/Março\n3. Classe textural do solo: Argilosa\n4. Teor de argila no solo: 65%\n5. Uso anterior da terra: Culturas anuais (Soja/Milho)\n6. Sistema de cultivo atual: Sistema Plantio Direto (SPD)\n7. Tempo de adoção do sistema: >20 anos\n8. Área de queima de resíduos da cultura: 0 hectares\n9. Área de manejo de solos orgânicos: 0 hectares\n10. Área cultivada: 4,6 hectares\n11. Tipo de plantio atual: Soja\n12. Produtividade média: 3.800 kg/ha\n13. Tamanho de area de Mata: 0,4 hectare\n14. Estimativa de carbono estocado na vegetação (toneladas de CO2 equivalente): 146,8 tCO2e\n15. Estimativa de emissões de GEE (toneladas de CO2 equivalente): 9,2 tCO2e/ano";
            // adicionar um setTimeout de 10 segundos
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            return {
                prompt_utilizado: promptCompleto,
                resposta_completa: responseText,
                timestamp: new Date().toISOString(),
            };
        } catch (error: any) {
            throw new Error(`Falha na análise da IA: ${error.message}`);
        }
    }

    /**
     * Gera um relatório formatado a partir da análise e salva no banco
     */
    async generateReport(customPrompt: string, inputs: AnalysisInput, userId: string): Promise<{ report: string; relatorioId: string }> {
        const analysis = await this.analyzeImageWithCustomPrompt(customPrompt, inputs);

        const report = `## Análise

        ${analysis.resposta_completa}

*Relatório gerado automaticamente pelo Sistema de Inventário de Propriedades Rurais*
`;

        // Salvar relatório no banco de dados
        const relatorioId = await RelatorioModel.create(userId, analysis.resposta_completa);

        return { report, relatorioId };
    }

    async saveReport(customPrompt: string, inputs: AnalysisInput, userId: string): Promise<{ reportPath: string; analysis: AnalysisResult; relatorioId: string }> {
        const analysis = await this.analyzeImageWithCustomPrompt(customPrompt, inputs);
        
        const reportsDir = path.join(__dirname, '..', '..', 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        const timestamp = Date.now();
        const reportPath = path.join(reportsDir, `relatorio_${timestamp}.md`);

        const report = `## Análise
        ${analysis.resposta_completa}
        Relatório gerado automaticamente pelo sistema de análise de imagens`;

        await fs.writeFile(reportPath, report, 'utf-8');

        // Salvar relatório no banco de dados
        const relatorioId = await RelatorioModel.create(userId, analysis.resposta_completa);

        return { reportPath, analysis, relatorioId };
    }
}

export default new AIAnalysisService();
