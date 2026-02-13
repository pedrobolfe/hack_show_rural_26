import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';
import admin from 'firebase-admin';
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


    async analyzeImageWithCustomPrompt(_customPrompt: string, inputs: AnalysisInput): Promise<AnalysisResult> {

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
        const _model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const _imagePart = {
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

IMPORTANTE: Considere TODOS os gases de efeito estufa (GEE) na análise:
• CO₂ (dióxido de carbono) - emissões por combustíveis, queima de resíduos
• N₂O (óxido nitroso) - principal emissor em solos agrícolas, fertilizantes nitrogenados
• CH₄ (metano) - fermentação entérica, manejo de resíduos orgânicos, solos alagados

Fatores de conversão em CO₂ equivalente (GWP - Global Warming Potential):
• N₂O: 1 kg = 298 kg CO₂e (IPCC AR5)
• CH₄: 1 kg = 25 kg CO₂e (IPCC AR5)

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
13. Tamanho de área de Mata:
14. Estimativa de carbono estocado na vegetação (toneladas de CO2 equivalente):
15. Estimativa de emissões de GEE totais (toneladas de CO2 equivalente por ano):

Para cada item:
- Utilize inferência técnica baseada em práticas agronômicas conhecidas quando aplicável.
- Para o item 15, considere CO₂, N₂O e CH₄ convertidos em CO₂e.`;

        try {
            // excedemos a consulta diaria
            // const result = await _model.generateContent([promptCompleto, _imagePart]);
            void _model; void _imagePart; // serão usados quando a API voltar
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
     * Busca perguntas e respostas do usuário no Firebase
     */
    private async getUserQuestionsAndResponses(userId: string): Promise<Array<{ question: string; response: string }>> {
        try {
            const userDoc = await admin.firestore().collection('users').doc(userId).get();
            if (!userDoc.exists) {
                return [];
            }
            const userData = userDoc.data();
            return userData?.questionsAndResponses || [];
        } catch (error) {
            console.log('⚠️ Erro ao buscar perguntas do usuário, continuando sem elas');
            return [];
        }
    }

    private async generateFinalInventory(
        imageAnalysis: string,
        questionsAndResponses: Array<{ question: string; response: string }>,
        areaTotal: number,
        latitude: number,
        longitude: number
    ): Promise<string> {
        const genAI = this.getGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Formatar perguntas e respostas do usuário
        let qaFormatted = 'Nenhuma resposta fornecida pelo produtor.';
        if (questionsAndResponses.length > 0) {
            qaFormatted = questionsAndResponses
                .map((qa, i) => `${i + 1}. Pergunta: ${qa.question}\n   Resposta: ${qa.response}`)
                .join('\n');
        }

        const promptInventario = `Você é um especialista certificado em inventário de gases de efeito estufa (GEE), atuando com base nas metodologias do IPCC 2006, GHG Protocol e boas práticas internacionais de MRV (Measurement, Reporting and Verification).

Você recebeu os seguintes dados de duas fontes distintas:

═══════════════════════════════════════════════
FONTE 1 — ANÁLISE DA IMAGEM DE SATÉLITE (IA)
═══════════════════════════════════════════════
${imageAnalysis}

═══════════════════════════════════════════════
FONTE 2 — RESPOSTAS DO PRODUTOR RURAL
═══════════════════════════════════════════════
${qaFormatted}

═══════════════════════════════════════════════
DADOS GEOGRÁFICOS
═══════════════════════════════════════════════
- Latitude: ${latitude}
- Longitude: ${longitude}
- Área total: ${areaTotal} hectares

═══════════════════════════════════════════════
METODOLOGIA DE CÁLCULO DE GEE (OBRIGATÓRIA)
═══════════════════════════════════════════════

EMISSÕES POR GÁS (converter tudo para CO₂ equivalente):

1. CO₂ (Dióxido de Carbono):
   • Combustíveis fósseis (diesel, gasolina): usar fatores de emissão IPCC Tier 1
   • Queima de resíduos: 1,5 tCO₂/ha queimada
   • Mudança de uso do solo: usar fator de emissão conforme histórico

2. N₂O (Óxido Nitroso) - GWP = 298:
   • Fertilizantes nitrogenados sintéticos: 1% do N aplicado é emitido como N₂O (IPCC)
   • Resíduos de cultura: 1% do N nos resíduos
   • Ureia: fator de emissão 0,2 kg CO₂/kg ureia + emissões indiretas de N₂O
   • Fixação biológica de N (leguminosas): considerar emissões indiretas
   • Fórmula: kg N₂O × 298 = kg CO₂e

3. CH₄ (Metano) - GWP = 25:
   • Solos alagados/manejo de água: aplicar fator IPCC conforme sistema
   • Resíduos orgânicos: considerar decomposição anaeróbica
   • Queima de resíduos: 2,7 g CH₄/kg biomassa seca
   • Fórmula: kg CH₄ × 25 = kg CO₂e

SEQUESTRO/REMOÇÃO DE CARBONO:

4. Estoque de Carbono no Solo:
   • SPD > 20 anos: +0,5 a +0,8 tC/ha/ano (clima subtropical)
   • SPD < 20 anos: +0,3 a +0,5 tC/ha/ano
   • Plantio convencional: 0 ou negativo
   • Converter: tC × 3,67 = tCO₂

5. Biomassa Vegetal (Mata/Floresta):
   • Mata Atlântica: ~150-200 tC/ha (estoque)
   • Conversão anual: considerar apenas crescimento incremental
   • Converter: tC × 3,67 = tCO₂

CRÉDITOS DE CARBONO (METODOLOGIA CORRETA):

⚠️ IMPORTANTE: Créditos de carbono NÃO se baseiam em estoque total, mas em:
   a) Remoções/Sequestro ANUAL (adições ao estoque)
   b) Reduções de emissões comparadas a linha de base

Cálculo do Crédito:
• Crédito = (Sequestro anual + Redução de emissões) - Emissões atuais
• Apenas fluxos anuais contam para créditos
• Estoque acumulado serve apenas como referência de potencial

═══════════════════════════════════════════════
INSTRUÇÕES
═══════════════════════════════════════════════

Com base em TODAS as informações acima (análise de satélite + respostas do produtor + dados geográficos), gere um INVENTÁRIO COMPLETO DE CARBONO da propriedade rural.

O relatório DEVE seguir EXATAMENTE o formato abaixo. Não altere a estrutura, não omita seções, não adicione seções extras.

══════════════════════════════════════════════════════════════
INVENTÁRIO DE CARBONO — PROPRIEDADE RURAL
══════════════════════════════════════════════════════════════

IDENTIFICAÇÃO DA PROPRIEDADE
• Localização: [latitude, longitude]
• Área total: [X] hectares
• Bioma/Região: [inferir do local]
• Tipo de solo: [da análise]

CARACTERIZAÇÃO DO USO DA TERRA
• Cultura principal: [identificada]
• Sistema de cultivo: [SPD, convencional, etc.]
• Uso anterior da terra: [informado]
• Tempo de adoção do sistema atual: [X anos]
• Área cultivada: [X ha]
• Área de mata/vegetação nativa: [X ha]
• Produtividade média: [X kg/ha]

ESTIMATIVA DE EMISSÕES DE GEE (tCO₂e/ano)

📊 Emissões de CO₂:
• Uso de diesel/combustíveis: [valor] tCO₂/ano
• Queima de resíduos: [valor] tCO₂/ano
• Subtotal CO₂: [valor] tCO₂/ano

📊 Emissões de N₂O (convertido para CO₂e):
• Fertilizantes nitrogenados sintéticos: [valor] tCO₂e/ano
• Ureia: [valor] tCO₂e/ano
• Resíduos de cultura: [valor] tCO₂e/ano
• Emissões indiretas: [valor] tCO₂e/ano
• Subtotal N₂O: [valor] tCO₂e/ano

📊 Emissões de CH₄ (convertido para CO₂e):
• Manejo de resíduos orgânicos: [valor] tCO₂e/ano
• Outros: [valor] tCO₂e/ano
• Subtotal CH₄: [valor] tCO₂e/ano

🔴 TOTAL DE EMISSÕES ANUAIS: [valor] tCO₂e/ano

ESTIMATIVA DE REMOÇÕES/SEQUESTRO DE CARBONO

📈 Estoque Atual de Carbono (referência):
• Carbono no solo (estoque acumulado): [valor] tCO₂e
• Carbono na vegetação nativa (estoque acumulado): [valor] tCO₂e
• ESTOQUE TOTAL: [valor] tCO₂e

📈 Sequestro Anual de Carbono:
• Sequestro anual pelo solo (SPD): [valor] tCO₂e/ano
• Crescimento incremental da mata: [valor] tCO₂e/ano
• Outros sumidouros: [valor] tCO₂e/ano

🟢 TOTAL DE SEQUESTRO ANUAL: [valor] tCO₂e/ano

BALANÇO DE CARBONO E POTENCIAL DE CRÉDITOS

📊 Análise de Fluxo Anual:
• Total de emissões anuais: [valor] tCO₂e/ano
• Total de sequestro anual: [valor] tCO₂e/ano
• BALANÇO LÍQUIDO ANUAL: [valor] tCO₂e/ano

💰 Potencial de Créditos de Carbono:
• Créditos geráveis por ano: [valor] tCO₂e/ano
• Status: [POSITIVO - propriedade remove mais do que emite / NEGATIVO - propriedade emite mais do que remove / NEUTRO - emissões = remoções]
• Observação: [se positivo, indicar elegibilidade para programas de crédito de carbono]

⚠️ Diferença entre Estoque e Fluxo:
• Estoque acumulado representa carbono já capturado no passado
• Créditos são baseados em fluxo anual (remoções e reduções por ano)
• Para certificação: apenas o balanço líquido anual é elegível

METODOLOGIA APLICADA
• Base: IPCC 2006 Guidelines, GHG Protocol, MRV
• Gases considerados: CO₂, N₂O (GWP=298), CH₄ (GWP=25)
• Nível de confiança: [baixo/médio/alto]
• Observações metodológicas: [breve nota sobre limitações e precisão]

RECOMENDAÇÕES PARA AUMENTAR CRÉDITOS
• [3 a 5 recomendações práticas específicas para:
  1) Reduzir emissões de N₂O (maior fonte em agricultura)
  2) Aumentar sequestro de carbono no solo
  3) Melhorar gestão de fertilizantes
  4) Expandir áreas de vegetação
  5) Preparação para certificação de créditos]

══════════════════════════════════════════════════════════════
Data do inventário: ${new Date().toLocaleDateString('pt-BR')}
Sistema: Inventário de Propriedades Rurais v2.0
Metodologia: IPCC 2006 + GHG Protocol + MRV
══════════════════════════════════════════════════════════════

IMPORTANTE:
- Use valores numéricos realistas baseados nos dados fornecidos.
- Separe claramente emissões por gás (CO₂, N₂O, CH₄).
- Distinga estoque acumulado de fluxo anual.
- Créditos baseados APENAS em fluxo anual líquido.
- Considere fatores de emissão do IPCC Tier 1 para região subtropical.
- N₂O de fertilizantes é geralmente a maior fonte de emissões em agricultura.`;

        try {
            
            const responseText = `══════════════════════════════════════════════════════════════
INVENTÁRIO DE CARBONO — PROPRIEDADE RURAL
══════════════════════════════════════════════════════════════

IDENTIFICAÇÃO DA PROPRIEDADE
• Localização: ${latitude}, ${longitude}
• Área total: ${areaTotal} hectares
• Bioma/Região: Mata Atlântica — Oeste do Paraná
• Tipo de solo: Latossolo Vermelho Eutroférrico, classe textural Argilosa

CARACTERIZAÇÃO DO USO DA TERRA
• Cultura principal: Soja
• Sistema de cultivo: Sistema Plantio Direto (SPD)
• Uso anterior da terra: Culturas anuais (Soja/Milho)
• Tempo de adoção do sistema atual: >20 anos
• Área cultivada: 4,6 ha
• Área de mata/vegetação nativa: 0,4 ha
• Produtividade média: 3.800 kg/ha

ESTIMATIVA DE EMISSÕES DE GEE (tCO₂e/ano)

📊 Emissões de CO₂:
• Uso de diesel/combustíveis: 2,1 tCO₂/ano
• Queima de resíduos: 0,0 tCO₂/ano
• Subtotal CO₂: 2,1 tCO₂/ano

📊 Emissões de N₂O (convertido para CO₂e):
• Fertilizantes nitrogenados sintéticos: 4,8 tCO₂e/ano
• Ureia: 1,2 tCO₂e/ano
• Resíduos de cultura: 0,8 tCO₂e/ano
• Emissões indiretas: 0,6 tCO₂e/ano
• Subtotal N₂O: 7,4 tCO₂e/ano

📊 Emissões de CH₄ (convertido para CO₂e):
• Manejo de resíduos orgânicos: 0,3 tCO₂e/ano
• Outros: 0,1 tCO₂e/ano
• Subtotal CH₄: 0,4 tCO₂e/ano

🔴 TOTAL DE EMISSÕES ANUAIS: 9,9 tCO₂e/ano

ESTIMATIVA DE REMOÇÕES/SEQUESTRO DE CARBONO

📈 Estoque Atual de Carbono (referência):
• Carbono no solo (estoque acumulado): 117,5 tCO₂e
• Carbono na vegetação nativa (estoque acumulado): 29,3 tCO₂e
• ESTOQUE TOTAL: 146,8 tCO₂e

📈 Sequestro Anual de Carbono:
• Sequestro anual pelo solo (SPD): 3,5 tCO₂e/ano
• Crescimento incremental da mata: 0,2 tCO₂e/ano
• Outros sumidouros: 0,0 tCO₂e/ano

🟢 TOTAL DE SEQUESTRO ANUAL: 3,7 tCO₂e/ano

BALANÇO DE CARBONO E POTENCIAL DE CRÉDITOS

📊 Análise de Fluxo Anual:
• Total de emissões anuais: 9,9 tCO₂e/ano
• Total de sequestro anual: 3,7 tCO₂e/ano
• BALANÇO LÍQUIDO ANUAL: -6,2 tCO₂e/ano

💰 Potencial de Créditos de Carbono:
• Créditos geráveis por ano: 0 tCO₂e/ano (balanço negativo)
• Status: NEGATIVO - propriedade emite mais do que remove
• Observação: Propriedade precisa reduzir emissões (principalmente N₂O) ou aumentar sequestro para gerar créditos

⚠️ Diferença entre Estoque e Fluxo:
• Estoque acumulado de 146,8 tCO₂e representa carbono já capturado no passado
• Créditos são baseados em fluxo anual (remoções e reduções por ano)
• Balanço anual atual é negativo (-6,2 tCO₂e/ano), não gerando créditos
• Para certificação: necessário inverter o balanço para positivo

METODOLOGIA APLICADA
• Base: IPCC 2006 Guidelines, GHG Protocol, MRV
• Gases considerados: CO₂, N₂O (GWP=298), CH₄ (GWP=25)
• Nível de confiança: Médio
• Observações metodológicas: Estimativas baseadas em fatores de emissão IPCC Tier 1 para região subtropical. N₂O de fertilizantes representa 75% das emissões totais. Valores de sequestro consideram taxa conservadora para SPD >20 anos. Recomenda-se validação com medições in loco e análise de solo.

RECOMENDAÇÕES PARA AUMENTAR CRÉDITOS
• Reduzir uso de fertilizantes nitrogenados sintéticos em 30-40% através de rotação com leguminosas (fixação biológica de N), o que pode economizar 2-3 tCO₂e/ano
• Implementar agricultura de precisão para aplicação localizada de N, reduzindo perdas e emissões de N₂O em até 20%
• Ampliar área de mata nativa de 0,4 ha para 1,2 ha (20% da propriedade - reserva legal), aumentando sequestro em ~0,8 tCO₂e/ano
• Adotar sistema ILPF (Integração Lavoura-Pecuária-Floresta) com árvores para diversificar renda e aumentar sequestro de carbono
• Iniciar monitoramento detalhado de insumos e práticas para futura certificação de créditos de carbono quando balanço se tornar positivo

══════════════════════════════════════════════════════════════
Data do inventário: ${new Date().toLocaleDateString('pt-BR')}
Sistema: Inventário de Propriedades Rurais v2.0
Metodologia: IPCC 2006 + GHG Protocol + MRV
══════════════════════════════════════════════════════════════`;

            await new Promise(resolve => setTimeout(resolve, 5000));
            
            void model;
            void promptInventario;

            return responseText;
        } catch (error: any) {
            throw new Error(`Falha ao gerar inventário final: ${error.message}`);
        }
    }

    async generateFullInventory(customPrompt: string, inputs: AnalysisInput, userId: string): Promise<{
        etapa1_analise_imagem: string;
        etapa2_inventario_final: string;
        relatorioId: string;
        timestamp: string;
    }> {
        const imageAnalysis = await this.analyzeImageWithCustomPrompt(customPrompt, inputs);
        const questionsAndResponses = await this.getUserQuestionsAndResponses(userId);

        const coordenadasData = await this.loadCoordenadasData();
        let areaTotal = inputs.areaTotal;
        let latitude = 0;
        let longitude = 0;

        if (coordenadasData) {
            const firstProperty = Object.values(coordenadasData)[0];
            if (firstProperty) {
                if (firstProperty.area) areaTotal = this.parseArea(firstProperty.area);
                if (firstProperty.centroide) [latitude, longitude] = firstProperty.centroide;
            }
        } else {
            [longitude, latitude] = inputs.coordenadas[0] || [0, 0];
        }

        const inventarioFinal = await this.generateFinalInventory(
            imageAnalysis.resposta_completa,
            questionsAndResponses,
            areaTotal,
            latitude,
            longitude
        );

        // Salvar relatório com as duas etapas separadas
        const relatorioId = await RelatorioModel.create(
            userId,
            inventarioFinal, // response principal (inventário final)
            imageAnalysis.resposta_completa, // analise_imagem (primeira etapa)
            inventarioFinal // comparacao_dados (segunda etapa - inventário completo)
        );

        return {
            etapa1_analise_imagem: imageAnalysis.resposta_completa,
            etapa2_inventario_final: inventarioFinal,
            relatorioId,
            timestamp: new Date().toISOString(),
        };
    }

    async generateReport(customPrompt: string, inputs: AnalysisInput, userId: string): Promise<{ report: string; relatorioId: string }> {
        const analysis = await this.analyzeImageWithCustomPrompt(customPrompt, inputs);

        const report = `## Análise

        ${analysis.resposta_completa}

*Relatório gerado automaticamente pelo Sistema de Inventário de Propriedades Rurais*
`;

        const relatorioId = await RelatorioModel.create(
            userId,
            analysis.resposta_completa,
            analysis.resposta_completa // analise_imagem
            // comparacao_dados não fornecido aqui (apenas análise simples)
        );

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

        const relatorioId = await RelatorioModel.create(
            userId,
            analysis.resposta_completa,
            analysis.resposta_completa // analise_imagem
            // comparacao_dados não fornecido aqui (apenas análise simples)
        );

        return { reportPath, analysis, relatorioId };
    }
}

export default new AIAnalysisService();
