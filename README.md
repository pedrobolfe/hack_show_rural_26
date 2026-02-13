# 🌱 Agronomia Carbono - API Completa# 🌱 Sistema de Inventário de Propriedades Rurais



Sistema completo para inventário de propriedades rurais com análise de satélite e IA.> **API para criação de relatórios/inventários de propriedades rurais com verificação por satélite**



------



## 📚 Documentação## 📋 Escopo do Sistema



- **📖 [AI_ANALYSIS_README.md](./AI_ANALYSIS_README.md)** - Guia completo de análise de IA### 🎯 Objetivo Principal

- **⚡ [TESTE_RAPIDO.md](./TESTE_RAPIDO.md)** - Como testar rapidamenteSistema focado **exclusivamente** na criação de inventários/relatórios de propriedades rurais através de questionário e verificação por satélite.

- **📊 [RESUMO_SISTEMA_IA.md](./RESUMO_SISTEMA_IA.md)** - Visão geral do sistema

### � O Que NÃO É Este Sistema

---- ❌ Sistema de auditoria

- ❌ Plataforma de cooperativas

## 🚀 Início Rápido- ❌ Marketplace de créditos de carbono

- ❌ Sistema de certificação complexo

### 1. Instalar Dependências

```bash### ✅ O Que É Este Sistema

npm install- ✅ Cadastro de produtores rurais

```- ✅ Questionário de 7+ perguntas sobre a propriedade

- ✅ Verificação da propriedade via satélite

### 2. Configurar `.env`- ✅ Identificação visual da propriedade

```env- ✅ Geração de relatório/inventário

# Firebase- ✅ (Futuro) Cálculo de compensação vs produção

FIREBASE_PROJECT_ID=seu-projeto

FIREBASE_PRIVATE_KEY=...---

FIREBASE_CLIENT_EMAIL=...

## 🔄 Fluxo do Sistema

# Gemini AI (OBRIGATÓRIO para análise de IA)

GEMINI_API_KEY=sua_chave_gemini```

1. Produtor se cadastra (nome, email, CAR)

# Sentinel Hub (Opcional - para imagens de satélite)2. Responde questionário (7+ perguntas)

SENTINELHUB_CLIENT_ID=seu_client_id3. Sistema busca propriedade via CAR

SENTINELHUB_CLIENT_SECRET=seu_client_secret4. Verifica localização via satélite

5. Identifica área com polígono

# OpenAI (Opcional - alternativa ao Gemini)6. Gera relatório/inventário

OPENAI_API_KEY=sua_chave_openai7. Produtor visualiza relatório

``````



### 3. Iniciar Servidor---

```bash

npm run dev## � Usuário Único: Produtor Rural

```

**Apenas produtores rurais** podem usar o sistema.

**Servidor roda em:** `http://localhost:3000`

### Dados do Produtor

---```json

{

## 📡 Endpoints Disponíveis  "name": "João Silva",

  "email": "joao@email.com",

### 👥 **Users** (`/api/users`)  "phone": "44999999999",

- `POST /api/users` - Criar usuário  "numCRA": "PR-1234567890"

- `GET /api/users` - Listar usuários}

- `GET /api/users/:id` - Buscar usuário```



### 🏡 **Properties** (`/api/properties`)---

- `POST /api/properties` - Criar propriedade

- `GET /api/properties` - Listar propriedades## 📝 Questionário do Inventário



### 🛰️ **Satellite** (`/api/properties/satellite/*`)O produtor responderá **pelo menos 7 perguntas** sobre sua propriedade:

- `POST /satellite/token` - Obter token OAuth2 Sentinel Hub

- `POST /satellite/image-url` - Preparar dados de requisição1. **Área Total da Propriedade** (hectares)

- `POST /satellite/polygon` - Baixar imagem + análise AI2. **Tipo de Produção Principal** (Grãos, Pecuária, Horticultura, etc.)

- `POST /satellite/polygon-json` - Processar de arquivo JSON3. **Práticas Sustentáveis Utilizadas**

- `GET /satellite/bbox` - Baixar por bounding box4. **Área de Preservação Permanente (APP)**

5. **Reserva Legal**

### 🤖 **AI Analysis** (`/api/ai/*`)6. **Uso de Agroquímicos**

- `POST /ai/analyze` - Análise simples (JSON)7. **Gestão de Resíduos**

- `POST /ai/report` - Gerar relatório (Markdown)

- `POST /ai/save-report` - Salvar relatório em arquivo**Nota:** Mais perguntas serão adicionadas conforme necessário.



------



## 🧪 Testar com Postman## 🛰️ Verificação por Satélite



### Importar Collection### Funcionalidades

1. Abra o Postman

2. Import → File → Selecione: **`postman_collection.json`**1. **Busca da Propriedade** via CAR

3. A collection aparece com 4 pastas organizadas2. **Imagem de Satélite** (Sentinel Hub)

3. **Identificação Visual** com polígono

### Estrutura da Collection4. **Geração de Imagem** com área destacada

```

🌱 Agronomia Carbono API - Completo---

├── 👥 Users (3 requests)

├── 🏡 Properties (2 requests)## 🚀 Início Rápido

├── 🛰️ Satellite (5 requests)

└── 🤖 AI Analysis (6 requests)```bash

```# Instalar dependências

npm install

---

# Desenvolvimento

## 💡 Casos de Usonpm run dev



### 1️⃣ **Análise de Imagem Estática**# Build

**Cenário:** Você já tem uma imagem e quer analisá-la com IAnpm run build



1. Coloque sua imagem em: `src/assets/image.png`# Produção

2. Use endpoint: `POST /api/ai/analyze`npm start

3. Personalize o prompt no body da requisição```



**Exemplo:**---

```json

{## � API Endpoints

  "prompt": "Analise esta propriedade rural e identifique tipos de vegetação, uso do solo e biomassa estimada."

}### 👤 Produtores

```

```bash

---POST   /api/users              # Criar produtor

GET    /api/users              # Listar todos

### 2️⃣ **Baixar Imagem de Satélite + Análise**GET    /api/users/:id          # Buscar por ID

**Cenário:** Você tem coordenadas e quer imagem Sentinel-2 + análise AIGET    /api/users/car/:numCRA  # Buscar por CAR

PUT    /api/users/:id          # Atualizar

1. Use endpoint: `POST /api/properties/satellite/polygon`DELETE /api/users/:id          # Deletar

2. Forneça coordenadas do polígono```

3. Sistema baixa imagem, desenha polígono e analisa com Gemini

### 🏞️ Propriedades

**Exemplo:**

```json```bash

{POST   /api/properties                    # Criar propriedade

  "coordinates": [GET    /api/properties                    # Listar todas

    { "lat": -24.74626, "lon": -53.56975 },GET    /api/properties/:id                # Buscar por ID

    { "lat": -24.74700, "lon": -53.56975 },GET    /api/properties/car/:carNumber     # Consultar CAR

    { "lat": -24.74700, "lon": -53.57050 },PUT    /api/properties/:id                # Atualizar

    { "lat": -24.74626, "lon": -53.57050 }DELETE /api/properties/:id                # Deletar

  ],```

  "analyzeWithAI": true

}### �️ Satélite

```

```bash

---POST /api/properties/satellite/polygon        # Polígono (coordenadas)

POST /api/properties/satellite/polygon-json   # Polígono (JSON)

### 3️⃣ **Processar de Arquivo JSON**GET  /api/properties/satellite/bbox           # Imagem por BBOX

**Cenário:** Você tem coordenadas salvas em JSON```



1. Coloque coordenadas em: `src/services/coordenadas.json`---

2. Use endpoint: `POST /api/properties/satellite/polygon-json`

3. Sistema lê automaticamente e processa## 📁 Estrutura



**Formato do JSON:**```

```jsonsrc/

{├── config/              # Configurações

  "propriedade_1": {├── middlewares/         # Middlewares

    "centroide": [-24.74626, -53.56975],├── modules/

    "pos1": { "lat": -24.74626, "lon": -53.56975 },│   ├── user/           # Produtores

    "pos2": { "lat": -24.74700, "lon": -53.56975 },│   └── property/       # Propriedades

    "pos3": { "lat": -24.74700, "lon": -53.57050 },├── services/           # Serviços externos

    "pos4": { "lat": -24.74626, "lon": -53.57050 }└── server.ts          # Servidor

  }```

}

```---



---## 🛣️ Roadmap



## 📝 Exemplos de Prompts para IA### ✅ Fase 1: Fundação (Atual)

- [x] Cadastro de produtores

### Análise Agronômica- [x] Integração com CAR

```- [x] Imagens de satélite

Você é um agrônomo especialista. Analise esta imagem e forneça:- [x] Polígonos sobre imagens

1. Tipos de vegetação visível

2. Saúde da vegetação### 🚧 Fase 2: Questionário (Próximo)

3. Estimativa de biomassa (ton/ha)- [ ] Modelo de questionário

4. Recomendações agronômicas- [ ] 7+ perguntas

```- [ ] Validação de respostas



### Crédito de Carbono### 🔮 Fase 3: Relatório (Futuro)

```- [ ] Geração de PDF

Você é auditor de créditos de carbono. Forneça:- [ ] Visualização de dados

- Biomassa total (ton)- [ ] Exportação

- Carbono sequestrado (ton CO2)

- Potencial de geração de créditos### 🌟 Fase 4: Cálculo (Futuro)

- Recomendações para aumentar sequestro- [ ] Cálculo de compensação

```- [ ] Indicador devendo/compensando



### Inventário Rural---

```

Realize inventário completo identificando:## ⚠️ Limitações do Escopo

- Uso do solo (% de cada tipo)

- Áreas de preservação### ❌ NÃO Implementaremos:

- Áreas produtivas- Auditoria

- Áreas degradadas- Cooperativas

- Oportunidades de melhoria- Créditos de carbono

```- Certificações oficiais

- Marketplace

---

---

## 📂 Estrutura de Arquivos

## 🎯 Foco

```

src/**Simplicidade e objetividade**. Cadastro → Questionário → Satélite → Relatório.

├── assets/

│   └── image.png              ← Coloque sua imagem aqui---

├── services/

│   ├── ai-analysis.service.ts ← Análise de IA## 🛠️ Stack

│   ├── satellite.service.ts   ← Sentinel Hub

│   └── coordenadas.json       ← Coordenadas de teste- Node.js + TypeScript

├── modules/- Express

│   ├── user/                  ← CRUD de usuários- Firebase Admin SDK

│   ├── property/              ← CRUD de propriedades- Sentinel Hub API

│   └── ai-analysis/           ← Análise de IA- Sharp (processamento de imagens)

└── server.ts

reports/                        ← Relatórios salvos automaticamente
temp_images/                    ← Imagens de satélite baixadas
postman_collection.json         ← Collection unificada do Postman
```

---

## 🔑 Obter API Keys

### Google Gemini (Grátis)
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma API key
3. Copie e cole no `.env`: `GEMINI_API_KEY=...`

### Sentinel Hub (Grátis com limitações)
1. Acesse: https://dataspace.copernicus.eu/
2. Crie conta e OAuth client
3. Copie credenciais para `.env`

---

## ⚙️ Configurações Importantes

### Para Análise de IA Apenas
```env
GEMINI_API_KEY=sua_chave    # ✅ OBRIGATÓRIO
```

### Para Satellite + IA
```env
GEMINI_API_KEY=sua_chave              # ✅ OBRIGATÓRIO
SENTINELHUB_CLIENT_ID=...             # ✅ OBRIGATÓRIO
SENTINELHUB_CLIENT_SECRET=...         # ✅ OBRIGATÓRIO
```

---

## 🎯 Fluxo Completo

```
1. Cadastro
   └─> POST /api/users (criar produtor)
   └─> POST /api/properties (criar propriedade)

2. Inventário com Satélite
   └─> POST /satellite/polygon (baixar imagem + AI)
   └─> Resultado: imagem + análise completa

3. Análise Personalizada
   └─> Copiar imagem para src/assets/image.png
   └─> POST /ai/analyze (com seu prompt)
   └─> Resultado: análise customizada

4. Relatório Final
   └─> POST /ai/save-report
   └─> Arquivo salvo em reports/
```

---

## 🐛 Troubleshooting

### Erro: "GEMINI_API_KEY não definida"
- ✅ Verifique se `.env` existe
- ✅ Verifique se a chave está correta
- ✅ Reinicie o servidor: `npm run dev`

### Erro: "Erro ao ler imagem"
- ✅ Verifique se existe `src/assets/image.png`
- ✅ Formato suportado: PNG, JPG, JPEG

### Erro: 401 Sentinel Hub
- ✅ Credenciais inválidas ou expiradas
- ✅ Gere novas credenciais no dashboard
- ✅ Verifique se `client_secret` está completo

---

## 📊 Resultados

### JSON Response (`/api/ai/analyze`)
```json
{
  "success": true,
  "data": {
    "prompt_utilizado": "...",
    "resposta_completa": "...",
    "timestamp": "2026-02-12T...",
    "imagem_analisada": "src/assets/image.png"
  }
}
```

### Relatório Markdown (`/api/ai/report`)
```markdown
# 📋 RELATÓRIO DE ANÁLISE DE IMAGEM
## 🤖 Análise da IA
...
```

### Arquivo Salvo (`/api/ai/save-report`)
```
reports/relatorio_1770940000000.md
```

---

## 🎉 Pronto!

Seu sistema está **100% funcional** com:
- ✅ API REST completa
- ✅ Análise de IA com prompts personalizáveis
- ✅ Imagens de satélite Sentinel-2
- ✅ Collection Postman unificada
- ✅ Documentação completa

**Próximo passo:** Importe **`postman_collection.json`** e comece a testar!

---

## 📚 Links Úteis

- **Postman Collection:** `postman_collection.json` ← **ÚNICO ARQUIVO**
- **Documentação AI:** [AI_ANALYSIS_README.md](./AI_ANALYSIS_README.md)
- **Guia Rápido:** [TESTE_RAPIDO.md](./TESTE_RAPIDO.md)
- **Visão Geral:** [RESUMO_SISTEMA_IA.md](./RESUMO_SISTEMA_IA.md)

---

**Desenvolvido para o Hack Show Rural 2026** 🚜🌱
