import { db } from '../../config/firebase.config';
import { CarbonCreditModel, ICarbonCredit, CreditStatus, CreditLifecycleAction } from './carbon-credit.model';
import certificateService from '../../services/certificate.service';
import blockchainAuditService from '../../services/blockchain-audit.service';

class CarbonCreditService {
  private collectionRef = db.collection('carbon_credits');
  private counterRef = db.collection('counters').doc('carbon_credits');

  /**
   * Obtém próximo número sequencial para serial
   */
  private async getNextSequence(): Promise<number> {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(this.counterRef);
      const currentValue = doc.exists ? doc.data()?.value || 0 : 0;
      const newValue = currentValue + 1;
      
      transaction.set(this.counterRef, { value: newValue }, { merge: true });
      return newValue;
    });
    
    return result;
  }

  /**
   * FASE 1: Criar rascunho de crédito (Operador)
   */
  async createDraft(data: Partial<ICarbonCredit>): Promise<CarbonCreditModel> {
    const tokenId = certificateService.generateTokenId();
    const sequence = await this.getNextSequence();
    const year = new Date().getFullYear();
    
    const serialNumber = certificateService.generateSerialNumber(
      data.countryCode || 'BR',
      year,
      `CLS${data.clusterId?.substring(0, 6).toUpperCase()}`,
      sequence
    );

    const credit = new CarbonCreditModel({
      ...data,
      tokenId,
      serialNumber,
      status: 'Draft'
    });

    const validation = credit.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const docRef = await this.collectionRef.add(credit.toFirestore());
    
    await blockchainAuditService.appendLog(
      'Created',
      'credit',
      docRef.id,
      credit.toFirestore(),
      credit.issuedBy
    );

    const doc = await docRef.get();
    return new CarbonCreditModel({ id: doc.id, ...doc.data() });
  }

  /**
   * FASE 2: Submeter para verificação (Operador)
   */
  async submitForVerification(creditId: string, submittedBy: string): Promise<CarbonCreditModel> {
    return this.updateStatus(creditId, 'Pending', 'Submitted_For_Verification', submittedBy);
  }

  /**
   * FASE 3: Verificar crédito (Verificador Externo)
   */
  async verifyCreditByVerifier(creditId: string, verifiedBy: string): Promise<CarbonCreditModel> {
    const docRef = this.collectionRef.doc(creditId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    const credit = doc.data();
    
    if (credit?.status !== 'Pending') {
      throw new Error('Crédito não está pendente de verificação');
    }

    await docRef.update({
      status: 'Verified',
      verifiedBy: verifiedBy,
      updatedAt: new Date()
    });

    await blockchainAuditService.appendLog(
      'Verified',
      'credit',
      creditId,
      { verifiedBy, previousStatus: 'Pending' },
      verifiedBy
    );

    const updated = await docRef.get();
    return new CarbonCreditModel({ id: updated.id, ...updated.data() });
  }

  /**
   * FASE 4: Certificar e Assinar (Supervisor)
   */
  async certifyAndSign(creditId: string, approvedBy: string, privateKey: string): Promise<CarbonCreditModel> {
    const docRef = this.collectionRef.doc(creditId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    const credit = doc.data();
    
    if (credit?.status !== 'Verified') {
      throw new Error('Crédito deve estar verificado antes de ser certificado');
    }

    // Preparar dados para assinatura
    const certificateData = {
      tokenId: credit.tokenId,
      serialNumber: credit.serialNumber,
      carbonAmount: credit.carbonAmount,
      netCarbonAmount: credit.netCarbonAmount,
      certificate: credit.certificate,
      clusterId: credit.clusterId,
      timestamp: new Date().toISOString()
    };

    // Assinar certificado
    const signatureData = certificateService.signCertificate(certificateData, privateKey);

    await docRef.update({
      status: 'Certified',
      approvedBy: approvedBy,
      digitalSignature: signatureData.signature,
      publicKey: signatureData.publicKey,
      updatedAt: new Date()
    });

    await blockchainAuditService.appendLog(
      'Certified',
      'credit',
      creditId,
      { approvedBy, signatureHash: signatureData.data },
      approvedBy
    );

    const updated = await docRef.get();
    return new CarbonCreditModel({ id: updated.id, ...updated.data() });
  }

  /**
   * FASE 5: Emitir crédito (Sistema)
   */
  async issueCredit(creditId: string): Promise<CarbonCreditModel> {
    const docRef = this.collectionRef.doc(creditId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    const credit = doc.data();
    
    if (credit?.status !== 'Certified') {
      throw new Error('Crédito deve estar certificado antes de ser emitido');
    }

    await docRef.update({
      status: 'Issued',
      issuedAt: new Date(),
      updatedAt: new Date()
    });

    await blockchainAuditService.appendLog(
      'Issued',
      'credit',
      creditId,
      { issuedAt: new Date() },
      'system'
    );

    const updated = await docRef.get();
    return new CarbonCreditModel({ id: updated.id, ...updated.data() });
  }

  /**
   * Transferir propriedade (Venda)
   */
  async transferOwnership(
    creditId: string,
    newOwnerId: string,
    price?: number,
    currency: string = 'BRL'
  ): Promise<CarbonCreditModel> {
    const docRef = this.collectionRef.doc(creditId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    const credit = new CarbonCreditModel({ id: doc.id, ...doc.data() });
    
    if (credit.status !== 'Issued' && credit.status !== 'Reserved') {
      throw new Error('Apenas créditos emitidos ou reservados podem ser transferidos');
    }

    const ownershipEntry = {
      ownerId: newOwnerId,
      acquiredAt: new Date(),
      price,
      currency
    };

    const updatedHistory = [...credit.ownerHistory, ownershipEntry];

    await docRef.update({
      currentOwnerId: newOwnerId,
      ownerHistory: updatedHistory,
      status: 'Sold',
      updatedAt: new Date()
    });

    await blockchainAuditService.appendLog(
      'Sold',
      'credit',
      creditId,
      { newOwnerId, price, currency },
      credit.currentOwnerId || 'system'
    );

    const updated = await docRef.get();
    return new CarbonCreditModel({ id: updated.id, ...updated.data() });
  }

  /**
   * Aposentar crédito (Retirar do mercado)
   */
  async retireCredit(creditId: string, retiredBy: string, reason?: string): Promise<CarbonCreditModel> {
    const docRef = this.collectionRef.doc(creditId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    const credit = doc.data();
    
    if (credit?.status === 'Retired') {
      throw new Error('Crédito já está aposentado');
    }

    await docRef.update({
      status: 'Retired',
      retiredAt: new Date(),
      updatedAt: new Date()
    });

    await blockchainAuditService.appendLog(
      'Retired',
      'credit',
      creditId,
      { retiredBy, reason, retiredAt: new Date() },
      retiredBy
    );

    const updated = await docRef.get();
    return new CarbonCreditModel({ id: updated.id, ...updated.data() });
  }

  /**
   * Atualizar status genérico
   */
  private async updateStatus(
    creditId: string,
    newStatus: CreditStatus,
    action: CreditLifecycleAction,
    performedBy: string
  ): Promise<CarbonCreditModel> {
    const docRef = this.collectionRef.doc(creditId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    const previousStatus = doc.data()?.status;

    await docRef.update({
      status: newStatus,
      updatedAt: new Date()
    });

    await blockchainAuditService.appendLog(
      action,
      'credit',
      creditId,
      { previousStatus, newStatus },
      performedBy
    );

    const updated = await docRef.get();
    return new CarbonCreditModel({ id: updated.id, ...updated.data() });
  }

  /**
   * Verificar assinatura do certificado (API Pública)
   */
  async verifyCreditCertificate(tokenId: string): Promise<{
    isValid: boolean;
    credit?: any;
    message: string;
  }> {
    const snapshot = await this.collectionRef
      .where('tokenId', '==', tokenId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        isValid: false,
        message: 'Crédito não encontrado'
      };
    }

    const doc = snapshot.docs[0];
    const credit = new CarbonCreditModel({ id: doc.id, ...doc.data() });

    if (!credit.digitalSignature || !credit.publicKey) {
      return {
        isValid: false,
        credit: credit.getPublicInfo(),
        message: 'Crédito não possui assinatura digital'
      };
    }

    const certificateData = {
      tokenId: credit.tokenId,
      serialNumber: credit.serialNumber,
      carbonAmount: credit.carbonAmount,
      netCarbonAmount: credit.netCarbonAmount,
      certificate: credit.certificate,
      clusterId: credit.clusterId,
      timestamp: credit.issuedAt?.toISOString()
    };

    const isValid = certificateService.verifyCertificate(
      certificateData,
      credit.digitalSignature,
      credit.publicKey
    );

    return {
      isValid,
      credit: credit.getPublicInfo(),
      message: isValid ? 'Certificado válido' : 'Assinatura inválida'
    };
  }

  /**
   * Buscar todos os créditos
   */
  async findAll(limit = 50): Promise<CarbonCreditModel[]> {
    const snapshot = await this.collectionRef.limit(limit).get();
    
    const credits: CarbonCreditModel[] = [];
    snapshot.forEach((doc: any) => {
      credits.push(new CarbonCreditModel({ id: doc.id, ...doc.data() }));
    });

    return credits;
  }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<CarbonCreditModel> {
    const doc = await this.collectionRef.doc(id).get();

    if (!doc.exists) {
      throw new Error('Crédito não encontrado');
    }

    return new CarbonCreditModel({ id: doc.id, ...doc.data() });
  }

  /**
   * Buscar por status
   */
  async findByStatus(status: CreditStatus): Promise<CarbonCreditModel[]> {
    const snapshot = await this.collectionRef
      .where('status', '==', status)
      .get();

    const credits: CarbonCreditModel[] = [];
    snapshot.forEach((doc: any) => {
      credits.push(new CarbonCreditModel({ id: doc.id, ...doc.data() }));
    });

    return credits;
  }
}

export default new CarbonCreditService();
