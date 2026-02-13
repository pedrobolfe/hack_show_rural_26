import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs/promises';
import * as path from 'path';

interface AnalysisInput {
    areaTotal: number; // hectares
    coordenadas: Array<[number, number]>; // [[lng, lat], ...]
    usoSoloAtual: string; // ex: pastagem, floresta nativa, agricultura, área degradada
    historicoUso?: string; // opcional
    dadosAdicionais?: string; // opcional
}

interface AnalysisResult {
    prompt_utilizado: string;
    entradas_fornecidas: AnalysisInput;
    resposta_completa: string;
    timestamp: string;
    imagem_analisada: string;
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
     * Analisa a imagem em src/assets/image.png com um prompt personalizado
     */
    async analyzeImageWithCustomPrompt(customPrompt: string, inputs: AnalysisInput): Promise<AnalysisResult> {
        console.log('=================================================');
        console.log('🤖 ANÁLISE DE IMAGEM COM IA');
        console.log('=================================================');
        console.log('📊 Entradas fornecidas:');
        console.log('   - Área total:', inputs.areaTotal, 'hectares');
        console.log('   - Coordenadas:', inputs.coordenadas.length, 'pontos');
        console.log('   - Uso do solo:', inputs.usoSoloAtual);
        if (inputs.historicoUso) console.log('   - Histórico:', inputs.historicoUso);
        if (inputs.dadosAdicionais) console.log('   - Dados adicionais:', inputs.dadosAdicionais);

        // 1. Ler a imagem
        const imagePath = path.join(__dirname, '..', 'assets', 'image.png');
        console.log('📁 Lendo imagem:', imagePath);
        
        let imageBuffer: Buffer;
        try {
            imageBuffer = await fs.readFile(imagePath);
            console.log('✅ Imagem carregada:', (imageBuffer.length / 1024).toFixed(1), 'KB');
        } catch (error: any) {
            throw new Error(`Erro ao ler imagem: ${error.message}`);
        }

        // 2. Preparar o modelo Gemini
        const genAI = this.getGemini();
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // 3. Preparar os dados
        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType: 'image/png' as const,
            },
        };

        // Montar prompt completo com as entradas
        const promptCompleto = `
${customPrompt}

**DADOS FORNECIDOS:**

- **Área total da propriedade:** ${inputs.areaTotal} hectares
- **Coordenadas do polígono demarcado:** ${JSON.stringify(inputs.coordenadas)}
- **Uso do solo atual:** ${inputs.usoSoloAtual}
${inputs.historicoUso ? `- **Histórico de uso:** ${inputs.historicoUso}` : ''}
${inputs.dadosAdicionais ? `- **Dados adicionais:** ${inputs.dadosAdicionais}` : ''}

Analise a imagem de satélite fornecida considerando estes dados.
`;

        console.log('📤 Enviando para Gemini...');
        console.log('📝 Prompt:', promptCompleto.substring(0, 150) + '...');

        // 4. Enviar para o Gemini
        const result = await model.generateContent([promptCompleto, imagePart]);
        const responseText = result.response.text();

        console.log('✅ Resposta recebida do Gemini');
        console.log('📊 Tamanho da resposta:', responseText.length, 'caracteres');
        console.log('=================================================');

        // 5. Retornar resultado estruturado
        return {
            prompt_utilizado: customPrompt,
            entradas_fornecidas: inputs,
            resposta_completa: responseText,
            timestamp: new Date().toISOString(),
            imagem_analisada: 'src/assets/image.png',
        };
    }

    /**
     * Gera um relatório formatado a partir da análise
     */
    async generateReport(customPrompt: string, inputs: AnalysisInput): Promise<string> {
        const analysis = await this.analyzeImageWithCustomPrompt(customPrompt, inputs);

        const report = `# 📋 RELATÓRIO DE ANÁLISE - INVENTÁRIO GEE

---

## 🖼️ Informações da Análise
- **Data da Análise:** ${new Date(analysis.timestamp).toLocaleString('pt-BR')}
- **Imagem Analisada:** ${analysis.imagem_analisada}

---

## 📊 Dados da Propriedade

### Área Total
**${analysis.entradas_fornecidas.areaTotal} hectares**

### Uso do Solo Atual
**${analysis.entradas_fornecidas.usoSoloAtual}**

### Coordenadas do Polígono
\`\`\`json
${JSON.stringify(analysis.entradas_fornecidas.coordenadas, null, 2)}
\`\`\`

${analysis.entradas_fornecidas.historicoUso ? `### Histórico de Uso\n${analysis.entradas_fornecidas.historicoUso}\n` : ''}
${analysis.entradas_fornecidas.dadosAdicionais ? `### Dados Adicionais\n${analysis.entradas_fornecidas.dadosAdicionais}\n` : ''}

---

## 📝 Metodologia

Análise baseada em:
- **IPCC** (2006 Guidelines for National Greenhouse Gas Inventories e atualizações)
- **GHG Protocol**
- **Boas práticas internacionais de MRV** (Measurement, Reporting and Verification)

### Objetivo
Realizar uma avaliação inicial do potencial de emissões e sequestro de carbono da área com base nas informações fornecidas.

---

## 🤖 Análise da IA

${analysis.resposta_completa}

---

## 📊 Metadados Técnicos
- **Modelo IA:** Google Gemini 1.5 Flash
- **Timestamp:** ${analysis.timestamp}
- **Tamanho da Resposta:** ${analysis.resposta_completa.length} caracteres
- **Prompt Utilizado:** ${analysis.prompt_utilizado.substring(0, 100)}...

---

*Relatório gerado automaticamente pelo Sistema de Inventário de Propriedades Rurais*
`;

        return report;
    }

    /**
     * Salva o relatório em arquivo
     */
    async saveReport(customPrompt: string, inputs: AnalysisInput): Promise<{ reportPath: string; analysis: AnalysisResult }> {
        const analysis = await this.analyzeImageWithCustomPrompt(customPrompt, inputs);
        
        // Criar diretório de relatórios
        const reportsDir = path.join(__dirname, '..', '..', 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        // Gerar nome do arquivo
        const timestamp = Date.now();
        const reportPath = path.join(reportsDir, `relatorio_${timestamp}.md`);

        // Gerar relatório
        const report = `# 📋 RELATÓRIO DE ANÁLISE DE IMAGEM - INVENTÁRIO GEE

---

## 🖼️ Informações da Imagem
- **Arquivo:** ${analysis.imagem_analisada}
- **Data da Análise:** ${new Date(analysis.timestamp).toLocaleString('pt-BR')}

---

## 📊 Dados da Propriedade

### Área Total
**${analysis.entradas_fornecidas.areaTotal} hectares**

### Coordenadas do Polígono
\`\`\`json
${JSON.stringify(analysis.entradas_fornecidas.coordenadas, null, 2)}
\`\`\`

### Uso do Solo Atual
**${analysis.entradas_fornecidas.usoSoloAtual}**

${analysis.entradas_fornecidas.historicoUso ? `### Histórico de Uso\n${analysis.entradas_fornecidas.historicoUso}\n` : ''}
${analysis.entradas_fornecidas.dadosAdicionais ? `### Dados Adicionais\n${analysis.entradas_fornecidas.dadosAdicionais}\n` : ''}

---

## 📝 Prompt Utilizado
\`\`\`
${analysis.prompt_utilizado}
\`\`\`

---

## 🤖 Análise da IA

${analysis.resposta_completa}

---

## 📊 Metadados
- **Modelo IA:** Google Gemini 1.5 Flash
- **Timestamp:** ${analysis.timestamp}
- **Tamanho da Resposta:** ${analysis.resposta_completa.length} caracteres

---

*Relatório gerado automaticamente pelo sistema de análise de imagens*
`;

        // Salvar arquivo
        await fs.writeFile(reportPath, report, 'utf-8');
        console.log('💾 Relatório salvo em:', reportPath);

        return { reportPath, analysis };
    }
}

export default new AIAnalysisService();
