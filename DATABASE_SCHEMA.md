# Schema do Banco de Dados

## 🗂️ Collections

### 1. producers (Usuários)
```typescript
{
  uid: string;
  name: string;
  documentId_hash: string;  // LGPD compliant
  email: string;
  phone?: string;
  cooperativeId?: string;   // Se for produtor
  userType: 'produtor' | 'cooperativa';
  createdAt: Date;
}
```

### 2. properties (Propriedades)
```typescript
{
  id: string;
  ownerId: string;          // Ref: producers.uid
  carData: {
    number: string;         // BR-UF-MUN-XXX
    legalReserve: number;
    app: number;
    validated: boolean;
    validatedAt?: Date;
  };
  location: {
    city: string;
    state: string;
    center: { lat: number; lng: number; }
  };
  status: 'Active' | 'Pending' | 'Alert';
  areaDetails: {
    total: number;
    forest: number;
    app: number;
    productive: number;
  };
  geoJson?: any;            // Polígono da propriedade
  pooling: {
    isInCluster: boolean;
    clusterId?: string;
  };
  currentCarbonStock?: number;  // Toneladas
  lastSatelliteAnalysis?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. carbon_metrics (Subcollection)
```
Path: properties/{propertyId}/metrics/{metricId}
```
```typescript
{
  propertyId: string;
  date: Date;
  ndviScore?: number;           // Índice vegetação
  biomassEstimate?: number;
  carbonSequestrated: number;    // Toneladas
  source: string;                // 'Sentinel-2'
  createdAt: Date;
}
```

### 4. clusters (Pooling)
```typescript
{
  id: string;
  propertyIds: string[];        // Array de refs
  totalCarbonCredits: number;
  status: 'In_Verification' | 'Certified' | 'Sold' | 'Active';
  auditorId?: string;
  cooperativeId?: string;
  createdAt: Date;
  updatedAt: Date;
  certifiedAt?: Date;
}
```

### 5. audit_logs (Rastreabilidade)
```typescript
{
  timestamp: Date;
  action: 'Property_Created' | 'Property_Validated' | 
          'Carbon_Calculated' | 'Cluster_Created' | 
          'Credits_Issued' | 'Status_Changed' | ...;
  propertyId?: string;
  clusterId?: string;
  previousValue?: any;
  newValue?: any;
  triggeredBy: string;          // uid ou 'system'
  metadata?: any;
}
```

## 🔄 Fluxo de Dados

1. **Produtor cadastra** → `producers`
2. **Adiciona propriedade com CAR** → `properties` (status: Pending)
3. **Sistema sincroniza CAR** → Atualiza `properties` + `audit_logs`
4. **Análise satelital mensal** → Cria `carbon_metrics`
5. **Auto-pooling** → Agrupa em `clusters`
6. **Certificação** → Status Certified + `audit_logs`
