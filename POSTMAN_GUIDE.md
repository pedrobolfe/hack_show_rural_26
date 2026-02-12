# 📮 Guia de Uso - Postman Collection

## 🚀 Importar Collection

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `postman_collection.json`
4. A collection "EcoTrust Agropool API" será importada

## 🔧 Configurar Ambiente

A collection usa a variável `{{baseUrl}}` que está configurada para:
```
http://localhost:3000
```

Se precisar mudar:
1. Vá em **Variables** na collection
2. Altere o valor de `baseUrl`

## 📋 Fluxo Completo de Teste

### 1️⃣ Criar Cooperativa
```
POST /api/users
```
Salve o `id` retornado como `COOP_ID`

### 2️⃣ Criar Produtor
```
POST /api/users
```
Use o `COOP_ID` no campo `cooperativeId`
Salve o `id` retornado como `USER_ID`

### 3️⃣ Criar Propriedade
```
POST /api/properties
```
Use o `USER_ID` no campo `ownerId`
Salve o `id` retornado como `PROPERTY_ID`

### 4️⃣ Sincronizar CAR
```
POST /api/properties/:propertyId/sync-car
```
Substitua `:propertyId` pelo `PROPERTY_ID`

### 5️⃣ Criar Crédito (Draft)
```
POST /api/credits
```
Salve o `id` retornado como `CREDIT_ID`

### 6️⃣ Ciclo de Certificação

**a) Submeter**
```
POST /api/credits/:creditId/submit
```

**b) Verificar**
```
POST /api/credits/:creditId/verify
```

**c) Certificar e Assinar**
```
POST /api/credits/:creditId/certify
```
⚠️ Nota: Para gerar um par de chaves RSA para teste, veja abaixo.

**d) Emitir**
```
POST /api/credits/:creditId/issue
```

**e) Transferir**
```
POST /api/credits/:creditId/transfer
```

**f) Aposentar**
```
POST /api/credits/:creditId/retire
```

### 7️⃣ Verificação Pública
```
GET /api/credits/verify/:tokenId
```
Use o `tokenId` retornado ao criar o crédito

## 🔐 Gerar Par de Chaves RSA para Testes

Execute no terminal:

```bash
# Gerar chave privada
openssl genrsa -out private_key.pem 2048

# Gerar chave pública
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Ver chave privada (copie para usar no Postman)
cat private_key.pem
```

Ou use este código Node.js:

```javascript
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

console.log('=== PRIVATE KEY ===');
console.log(privateKey);
console.log('\n=== PUBLIC KEY ===');
console.log(publicKey);
```

## 📊 Status dos Créditos

```
Draft       → Criado pelo operador
Pending     → Aguardando verificação
Verified    → Verificado por entidade externa
Certified   → Certificado e assinado digitalmente
Issued      → Emitido, pronto para venda
Sold        → Vendido
Retired     → Aposentado (usado para compensação)
Cancelled   → Cancelado
Suspended   → Suspenso
```

## 🎯 Exemplos de Uso

### Listar créditos disponíveis
```
GET /api/credits/status/Issued
```

### Listar propriedades sem cluster
```
GET /api/properties/without-cluster
```

### Ver propriedades de um produtor
```
GET /api/properties/owner/:userId
```

### Listar apenas produtores
```
GET /api/users/type/produtor
```

## 🔍 Verificação Pública

A API pública de verificação permite que QUALQUER pessoa valide a autenticidade de um certificado:

```
GET /api/credits/verify/:tokenId
```

Retorna:
- ✅ `isValid: true` - Certificado válido
- ❌ `isValid: false` - Certificado inválido ou não encontrado
- 📄 Informações públicas do crédito

## 💡 Dicas

1. **Use variáveis do Postman** para armazenar IDs
2. **Salve os responses** para referência
3. **Teste o fluxo completo** na ordem indicada
4. **Verifique os logs** no terminal do servidor
5. **API pública** não requer autenticação

## 🆘 Troubleshooting

### Erro: "Crédito não está no status correto"
- Verifique o status atual com `GET /api/credits/:id`
- Siga a ordem do ciclo de vida

### Erro: "Assinatura inválida"
- Certifique-se de usar um par de chaves RSA válido
- A chave privada deve estar no formato PEM

### Erro: "Propriedade não encontrada"
- Verifique se o ID está correto
- Certifique-se de que a propriedade foi criada

## 📚 Documentação Adicional

- `README.md` - Visão geral do projeto
- `CERTIFICACAO.md` - Detalhes do sistema de certificação
- `DATABASE_SCHEMA.md` - Estrutura do banco de dados
