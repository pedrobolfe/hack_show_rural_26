# 🔌 Integração Frontend (Expo) ↔️ Backend (Node.js)

## 📝 Mudanças Implementadas

O arquivo `apirequest.js` foi **completamente reescrito** para se alinhar com as rotas reais da API backend.

### ⚠️ CORREÇÕES PRINCIPAIS:

1. **URL Base Corrigida:**
   - ❌ Antiga: `http://localhost:8081`
   - ✅ Nova: `http://localhost:3000/api`

2. **Rotas Atualizadas:**
   Todas as rotas agora seguem a estrutura real da API:
   - `/api/users/*` - Gerenciamento de usuários
   - `/api/properties/*` - Gerenciamento de propriedades
   - `/api/properties/satellite/*` - Dados de satélite
   - `/api/ai/*` - Análises com IA

---

## 🎯 Funções Disponíveis

### 👤 USUÁRIOS

```javascript
// Criar novo usuário (produtor)
await registerUser({
  name: "João Silva",
  email: "joao@example.com",
  phone: "(11) 98765-4321",
  role: "produtor",
  userType: "produtor",
  numCRA: "MS-5401405-ABCD1234567890"
});

// Buscar usuário por email
await getUserByEmail("joao@example.com");

// Buscar usuário por ID
await getUserById("userId123");

// Buscar usuário por número do CAR
await getUserByCAR("MS-5401405-ABCD1234567890");

// Atualizar perfil
await updateProfile("userId123", { name: "João Silva Atualizado" });

// Listar todos os usuários
await getAllUsers(50);
```

### 🏡 PROPRIEDADES

```javascript
// Criar nova propriedade
await createPropriedade({
  ownerId: "userId123",
  carData: {
    number: "MS-5401405-ABCD1234567890",
    legalReserve: 20,
    app: 10,
    validated: false
  },
  location: {
    city: "Campo Grande",
    state: "MS",
    center: { lat: -20.4697, lng: -54.6201 }
  },
  status: "Pending",
  areaDetails: {
    total: 100,
    forest: 30,
    app: 10,
    productive: 60,
    legalReserve: 20
  },
  pooling: { isInCluster: false }
});

// Buscar propriedades do usuário
await getPropriedadesByOwner("userId123");

// Buscar propriedade por ID
await getPropriedadeById("propertyId123");

// Consultar dados do CAR
await consultarCAR("MS-5401405-ABCD1234567890");

// Sincronizar dados do CAR
await syncCarData("propertyId123", "MS-5401405-ABCD1234567890");

// Atualizar status
await updatePropertyStatus("propertyId123", "Active");

// Listar todas as propriedades
await getAllProperties(50);
```

### 🛰️ SATÉLITE

```javascript
// Obter token do Sentinel Hub
await getSentinelToken();

// Obter URL da imagem
await getSateliteImageUrl({
  coordinates: [
    [-53.6, -24.78],
    [-53.55, -24.78],
    [-53.55, -24.73],
    [-53.6, -24.73],
    [-53.6, -24.78]
  ],
  date: "2024-06-15"
});

// Obter imagem com polígono
await getSateliteImageWithPolygon({
  coordinates: [...],
  date: "2024-06-15"
});

// Obter imagem por BBOX
await getSateliteByBbox({
  bbox: "-53.60,-24.78,-53.55,-24.73",
  date: "2024-06-15",
  width: 1024,
  height: 1024
});
```

### 🤖 ANÁLISE IA

```javascript
// Analisar imagem com IA
await analyzeImageWithAI({
  prompt: "Analise esta imagem de satélite...",
  inputs: {
    areaTotal: 100,
    coordenadas: [
      [-53.6, -24.78],
      [-53.55, -24.78],
      [-53.55, -24.73],
      [-53.6, -24.73],
      [-53.6, -24.78]
    ],
    usoSoloAtual: "pastagem",
    historicoUso: "Área anteriormente utilizada para agricultura",
    dadosAdicionais: "Solo argiloso, clima subtropical"
  }
});

// Gerar relatório em Markdown
await generateReport({ prompt: "...", inputs: {...} });

// Salvar relatório em arquivo
await saveReport({ prompt: "...", inputs: {...} });
```

---

## 🔄 Funções de Compatibilidade (LEGACY)

Para não quebrar o código antigo, mantemos alguns aliases:

```javascript
// Estas funções ainda funcionam mas usam as novas rotas por baixo dos panos:
loginUser() → getUserByEmail()
getPropriedadeData() → getPropriedadesByOwner()
submitQuestionario() → createPropriedade()
getSateliteData() → getSateliteImageWithPolygon()
getRelatorioFinal() → analyzeImageWithAI()
```

---

## ⚙️ Como Usar no Seu Componente

```javascript
import { 
  registerUser, 
  getUserByEmail, 
  createPropriedade,
  getSateliteImageWithPolygon,
  analyzeImageWithAI 
} from '../apirequest';

// Exemplo em um componente React Native
const handleRegister = async () => {
  try {
    const result = await registerUser({
      name: nome,
      email: email,
      numCRA: carNumber,
      // ... outros campos
    });
    console.log('Usuário criado:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

---

## 🚀 Próximos Passos

1. ✅ Arquivo `apirequest.js` atualizado
2. ⏳ Atualizar componentes React Native para usar as novas funções
3. ⏳ Testar integração completa frontend ↔️ backend
4. ⏳ Adicionar tratamento de erros mais robusto
5. ⏳ Implementar sistema de autenticação (se necessário)

---

## 📚 Referências

- **Backend API:** `http://localhost:3000`
- **Coleção Postman:** `postman_collection.json` (na raiz do projeto)
- **Documentação da API:** Veja o README principal do projeto

---

**Data de Atualização:** 13 de fevereiro de 2026  
**Responsável:** Correção de integração API
