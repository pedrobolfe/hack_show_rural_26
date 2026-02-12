export type CreditStatus = 
  | 'Draft'           // Criado, aguardando aprovação
  | 'Pending'         // Aguardando verificação
  | 'Verified'        // Verificado, aguardando certificação
  | 'Certified'       // Certificado, pronto para emissão
  | 'Issued'          // Emitido, disponível para venda
  | 'Reserved'        // Reservado para transação
  | 'Sold'            // Vendido
  | 'Retired'         // Aposentado (usado)
  | 'Cancelled'       // Cancelado
  | 'Suspended';      // Suspenso por auditoria

export type CreditLifecycleAction =
  | 'Created'
  | 'Submitted_For_Verification'
  | 'Verified'
  | 'Certified'
  | 'Issued'
  | 'Reserved'
  | 'Sold'
  | 'Retired'
  | 'Cancelled'
  | 'Suspended';

export interface ICertificateMetadata {
  methodology: string;              // Ex: VCS, Gold Standard
  vintage: number;                  // Ano do sequestro
  projectType: string;              // Reflorestamento, Conservação, etc
  verifier: string;                 // Entidade verificadora
  certificationDate: Date;
  expiryDate?: Date;
  geographicScope: string;          // BR-PR-Cascavel
  additionalCertifications?: string[]; // ISO 14064, etc
}

export interface ICarbonCredit {
  id?: string;
  tokenId: string;                  // ID único do token (UUID)
  serialNumber: string;             // Número serial público (legível)
  
  // Dados do Crédito
  clusterId: string;                // Cluster que originou
  propertyIds: string[];            // Propriedades incluídas
  carbonAmount: number;             // Toneladas de CO2e
  
  // Certificação
  status: CreditStatus;
  certificate: ICertificateMetadata;
  digitalSignature?: string;        // Assinatura digital do certificado
  publicKey?: string;               // Chave pública para verificação
  
  // Controle de Ciclo de Vida
  issuedBy: string;                 // uid do operador
  approvedBy?: string;              // uid do supervisor
  verifiedBy?: string;              // uid do verificador externo
  
  // Rastreabilidade
  ownerHistory: Array<{
    ownerId: string;
    acquiredAt: Date;
    price?: number;
    currency?: string;
  }>;
  
  currentOwnerId?: string;
  
  // Reserva de Segurança (Buffer)
  bufferPercentage: number;         // % retido para riscos (ex: 20%)
  netCarbonAmount: number;          // Após buffer
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  issuedAt?: Date;
  retiredAt?: Date;
  
  // Metadados adicionais
  countryCode: string;              // ISO 3166-1
  region: string;
  coordinates?: {
    centerLat: number;
    centerLng: number;
  };
}

export class CarbonCreditModel implements ICarbonCredit {
  id?: string;
  tokenId: string;
  serialNumber: string;
  clusterId: string;
  propertyIds: string[];
  carbonAmount: number;
  status: CreditStatus;
  certificate: ICertificateMetadata;
  digitalSignature?: string;
  publicKey?: string;
  issuedBy: string;
  approvedBy?: string;
  verifiedBy?: string;
  ownerHistory: Array<{
    ownerId: string;
    acquiredAt: Date;
    price?: number;
    currency?: string;
  }>;
  currentOwnerId?: string;
  bufferPercentage: number;
  netCarbonAmount: number;
  createdAt: Date;
  updatedAt: Date;
  issuedAt?: Date;
  retiredAt?: Date;
  countryCode: string;
  region: string;
  coordinates?: {
    centerLat: number;
    centerLng: number;
  };

  constructor(data: Partial<ICarbonCredit>) {
    this.id = data.id;
    this.tokenId = data.tokenId!;
    this.serialNumber = data.serialNumber!;
    this.clusterId = data.clusterId!;
    this.propertyIds = data.propertyIds || [];
    this.carbonAmount = data.carbonAmount!;
    this.status = data.status || 'Draft';
    this.certificate = data.certificate!;
    this.digitalSignature = data.digitalSignature;
    this.publicKey = data.publicKey;
    this.issuedBy = data.issuedBy!;
    this.approvedBy = data.approvedBy;
    this.verifiedBy = data.verifiedBy;
    this.ownerHistory = data.ownerHistory || [];
    this.currentOwnerId = data.currentOwnerId;
    this.bufferPercentage = data.bufferPercentage || 20; // Default 20%
    this.netCarbonAmount = data.netCarbonAmount || (this.carbonAmount * (1 - this.bufferPercentage / 100));
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.issuedAt = data.issuedAt;
    this.retiredAt = data.retiredAt;
    this.countryCode = data.countryCode || 'BR';
    this.region = data.region!;
    this.coordinates = data.coordinates;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.tokenId) errors.push('TokenId é obrigatório');
    if (!this.serialNumber) errors.push('Serial Number é obrigatório');
    if (!this.clusterId) errors.push('ClusterId é obrigatório');
    if (!this.carbonAmount || this.carbonAmount <= 0) {
      errors.push('Quantidade de carbono deve ser maior que zero');
    }
    if (!this.issuedBy) errors.push('IssuedBy é obrigatório');
    if (!this.certificate) errors.push('Dados do certificado são obrigatórios');

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore(): Omit<ICarbonCredit, 'id'> {
    return {
      tokenId: this.tokenId,
      serialNumber: this.serialNumber,
      clusterId: this.clusterId,
      propertyIds: this.propertyIds,
      carbonAmount: this.carbonAmount,
      status: this.status,
      certificate: this.certificate,
      digitalSignature: this.digitalSignature,
      publicKey: this.publicKey,
      issuedBy: this.issuedBy,
      approvedBy: this.approvedBy,
      verifiedBy: this.verifiedBy,
      ownerHistory: this.ownerHistory,
      currentOwnerId: this.currentOwnerId,
      bufferPercentage: this.bufferPercentage,
      netCarbonAmount: this.netCarbonAmount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      issuedAt: this.issuedAt,
      retiredAt: this.retiredAt,
      countryCode: this.countryCode,
      region: this.region,
      coordinates: this.coordinates
    };
  }

  // Método público para verificação
  getPublicInfo() {
    return {
      tokenId: this.tokenId,
      serialNumber: this.serialNumber,
      status: this.status,
      carbonAmount: this.carbonAmount,
      netCarbonAmount: this.netCarbonAmount,
      certificate: this.certificate,
      publicKey: this.publicKey,
      countryCode: this.countryCode,
      region: this.region,
      issuedAt: this.issuedAt
    };
  }
}
