# 🌱 Sistema de Certificação de Créditos de Carbono

## 🔐 Arquitetura de Segurança

### Níveis de Autorização

1. **Operador** - Cria rascunhos e submete
2. **Verificador** - Valida dados técnicos
3. **Supervisor** - Certifica e assina digitalmente
4. **Sistema** - Emite tokens automaticamente

## 📜 Ciclo de Vida do Crédito

```
Draft → Pending → Verified → Certified → Issued → Sold → Retired
```

### API Endpoints

#### 1. Criar Rascunho (Operador)
```http
POST /api/credits
{
  "clusterId": "cluster_001",
  "carbonAmount": 1500.5,
  "issuedBy": "operator_uid",
  "certificate": {
    "methodology": "VCS",
    "vintage": 2026,
    "projectType": "Reflorestamento",
    "verifier": "TÜV SÜD"
  }
}
```

#### 2. Submeter para Verificação
```http
POST /api/credits/:creditId/submit
{ "submittedBy": "operator_uid" }
```

#### 3. Verificar (Verificador Externo)
```http
POST /api/credits/:creditId/verify
{ "verifiedBy": "verifier_uid" }
```

#### 4. Certificar e Assinar (Supervisor)
```http
POST /api/credits/:creditId/certify
{
  "approvedBy": "supervisor_uid",
  "privateKey": "[FROM_KMS]"
}
```
**⚠️ PRODUÇÃO**: `privateKey` deve vir de **AWS KMS**, **Google Cloud KMS** ou **Azure Key Vault**

#### 5. Emitir Token
```http
POST /api/credits/:creditId/issue
```

#### 6. Transferir Propriedade
```http
POST /api/credits/:creditId/transfer
{
  "newOwnerId": "buyer_uid",
  "price": 50000,
  "currency": "BRL"
}
```

#### 7. Aposentar Crédito
```http
POST /api/credits/:creditId/retire
{
  "retiredBy": "owner_uid",
  "reason": "Compensação de emissões"
}
```

## 🌍 API Pública de Verificação

```http
GET /api/credits/verify/:tokenId
```

Retorna:
```json
{
  "success": true,
  "isValid": true,
  "credit": {
    "tokenId": "uuid",
    "serialNumber": "ECOT-BR-2026-CLS001-000123",
    "carbonAmount": 1500.5,
    "status": "Issued",
    "certificate": {...}
  },
  "message": "Certificado válido"
}
```

## 🔒 Segurança Implementada

### 1. Assinatura Digital RSA-2048
- Chave privada para assinar (HSM/KMS)
- Chave pública para verificar (armazenada)
- Algoritmo: RSA-SHA256

### 2. Blockchain Audit (Append-Only)
- Hash encadeado entre logs
- Imutável
- Rastreabilidade completa

### 3. Identificadores Únicos
- **TokenID**: UUID v4 (interno)
- **Serial Number**: ECOT-BR-2026-CLS001-000123 (público)

### 4. Buffer de Segurança
- 20% retido por padrão
- Protege contra riscos (queimadas, etc)
- `netCarbonAmount` = `carbonAmount` × 0.8

## 📊 Estrutura do Token

```typescript
{
  tokenId: string,              // UUID único
  serialNumber: string,         // Número serial legível
  carbonAmount: number,         // Toneladas CO2e
  netCarbonAmount: number,      // Após buffer
  digitalSignature: string,     // Assinatura RSA
  publicKey: string,            // Para verificação
  status: CreditStatus,
  certificate: {
    methodology: string,        // VCS, Gold Standard
    vintage: number,            // Ano
    verifier: string,           // Entidade
    certificationDate: Date
  },
  ownerHistory: [...],          // Rastreamento
  countryCode: string           // ISO 3166-1
}
```

## 🏛 Preparação Internacional

- ✅ Serial number com código de país
- ✅ Suporte multi-moeda
- ✅ Campos para metodologias globais (VCS, GS)
- ✅ API pública de verificação
- ✅ Audit log imutável
- ✅ Preparado para ISO 27001

## 🎯 Próximos Passos

1. **Integrar KMS** (AWS/GCP/Azure)
2. **Portal público** de verificação
3. **Relatórios** periódicos
4. **Auditoria externa** independente
5. **Certificação ISO 14064**
