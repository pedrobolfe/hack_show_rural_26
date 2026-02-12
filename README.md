# Hack Show Rural 2026 - API TypeScript

API modular em TypeScript com Firebase para gerenciamento de produtores e cooperativas.

## 🚀 Início Rápido

```bash
npm install
npm run dev      # Desenvolvimento
npm run build    # Build
npm start        # Produção
```

## 📁 Estrutura

```
src/
├── config/          # Configurações (Firebase, App)
├── middlewares/     # Middlewares
├── modules/         # Módulos da aplicação
│   └── user/       # Usuários (produtor/cooperativa)
├── utils/          # Utilitários
└── server.ts       # Servidor
```

## 📋 API - Usuários

```
POST   /api/users              - Criar
GET    /api/users              - Listar
GET    /api/users/:id          - Por ID
GET    /api/users/email/:email - Por email
GET    /api/users/type/:type   - Por tipo (produtor/cooperativa)
GET    /api/users/car/:numCRA  - Por CAR (produtores)
PUT    /api/users/:id          - Atualizar
DELETE /api/users/:id          - Deletar
```

## 👥 Tipos de Usuário

- **produtor**: Requer `numCRA` (CAR)
- **cooperativa**: Não requer CAR

## Exemplo - Criar Produtor

```json
POST /api/users
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "11999999999",
  "userType": "produtor",
  "numCRA": "BR1234567890"
}
```

## 🛠️ Stack

- Node.js + TypeScript
- Express
- Firebase Admin SDK
