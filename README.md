# 🌱 Sistema de Inventário de Propriedades Rurais

> **API para criação de relatórios/inventários de propriedades rurais com verificação por satélite**

---

## 📋 Escopo do Sistema

### 🎯 Objetivo Principal
Sistema focado **exclusivamente** na criação de inventários/relatórios de propriedades rurais através de questionário e verificação por satélite.

### � O Que NÃO É Este Sistema
- ❌ Sistema de auditoria
- ❌ Plataforma de cooperativas
- ❌ Marketplace de créditos de carbono
- ❌ Sistema de certificação complexo

### ✅ O Que É Este Sistema
- ✅ Cadastro de produtores rurais
- ✅ Questionário de 7+ perguntas sobre a propriedade
- ✅ Verificação da propriedade via satélite
- ✅ Identificação visual da propriedade
- ✅ Geração de relatório/inventário
- ✅ (Futuro) Cálculo de compensação vs produção

---

## 🔄 Fluxo do Sistema

```
1. Produtor se cadastra (nome, email, CAR)
2. Responde questionário (7+ perguntas)
3. Sistema busca propriedade via CAR
4. Verifica localização via satélite
5. Identifica área com polígono
6. Gera relatório/inventário
7. Produtor visualiza relatório
```

---

## � Usuário Único: Produtor Rural

**Apenas produtores rurais** podem usar o sistema.

### Dados do Produtor
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "44999999999",
  "numCRA": "PR-1234567890"
}
```

---

## 📝 Questionário do Inventário

O produtor responderá **pelo menos 7 perguntas** sobre sua propriedade:

1. **Área Total da Propriedade** (hectares)
2. **Tipo de Produção Principal** (Grãos, Pecuária, Horticultura, etc.)
3. **Práticas Sustentáveis Utilizadas**
4. **Área de Preservação Permanente (APP)**
5. **Reserva Legal**
6. **Uso de Agroquímicos**
7. **Gestão de Resíduos**

**Nota:** Mais perguntas serão adicionadas conforme necessário.

---

## 🛰️ Verificação por Satélite

### Funcionalidades

1. **Busca da Propriedade** via CAR
2. **Imagem de Satélite** (Sentinel Hub)
3. **Identificação Visual** com polígono
4. **Geração de Imagem** com área destacada

---

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

---

## � API Endpoints

### 👤 Produtores

```bash
POST   /api/users              # Criar produtor
GET    /api/users              # Listar todos
GET    /api/users/:id          # Buscar por ID
GET    /api/users/car/:numCRA  # Buscar por CAR
PUT    /api/users/:id          # Atualizar
DELETE /api/users/:id          # Deletar
```

### 🏞️ Propriedades

```bash
POST   /api/properties                    # Criar propriedade
GET    /api/properties                    # Listar todas
GET    /api/properties/:id                # Buscar por ID
GET    /api/properties/car/:carNumber     # Consultar CAR
PUT    /api/properties/:id                # Atualizar
DELETE /api/properties/:id                # Deletar
```

### �️ Satélite

```bash
POST /api/properties/satellite/polygon        # Polígono (coordenadas)
POST /api/properties/satellite/polygon-json   # Polígono (JSON)
GET  /api/properties/satellite/bbox           # Imagem por BBOX
```

---

## 📁 Estrutura

```
src/
├── config/              # Configurações
├── middlewares/         # Middlewares
├── modules/
│   ├── user/           # Produtores
│   └── property/       # Propriedades
├── services/           # Serviços externos
└── server.ts          # Servidor
```

---

## 🛣️ Roadmap

### ✅ Fase 1: Fundação (Atual)
- [x] Cadastro de produtores
- [x] Integração com CAR
- [x] Imagens de satélite
- [x] Polígonos sobre imagens

### 🚧 Fase 2: Questionário (Próximo)
- [ ] Modelo de questionário
- [ ] 7+ perguntas
- [ ] Validação de respostas

### 🔮 Fase 3: Relatório (Futuro)
- [ ] Geração de PDF
- [ ] Visualização de dados
- [ ] Exportação

### 🌟 Fase 4: Cálculo (Futuro)
- [ ] Cálculo de compensação
- [ ] Indicador devendo/compensando

---

## ⚠️ Limitações do Escopo

### ❌ NÃO Implementaremos:
- Auditoria
- Cooperativas
- Créditos de carbono
- Certificações oficiais
- Marketplace

---

## 🎯 Foco

**Simplicidade e objetividade**. Cadastro → Questionário → Satélite → Relatório.

---

## 🛠️ Stack

- Node.js + TypeScript
- Express
- Firebase Admin SDK
- Sentinel Hub API
- Sharp (processamento de imagens)
