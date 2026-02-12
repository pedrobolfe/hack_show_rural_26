import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface ISignatureData {
  data: string;
  signature: string;
  publicKey: string;
  algorithm: string;
  timestamp: Date;
}

class CertificateService {
  private algorithm = 'RSA-SHA256';
  
  /**
   * Gera par de chaves (simulação - em produção usar KMS)
   * Em produção: usar AWS KMS, Google Cloud KMS ou Azure Key Vault
   */
  generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Assina dados do certificado
   * IMPORTANTE: Em produção, a chave privada NUNCA deve estar no código
   * Deve ser armazenada em HSM ou Cloud KMS
   */
  signData(data: string, privateKey: string): string {
    const sign = crypto.createSign(this.algorithm);
    sign.update(data);
    sign.end();
    
    const signature = sign.sign(privateKey, 'base64');
    return signature;
  }

  /**
   * Verifica assinatura digital (público)
   */
  verifySignature(data: string, signature: string, publicKey: string): boolean {
    try {
      const verify = crypto.createVerify(this.algorithm);
      verify.update(data);
      verify.end();
      
      return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }

  /**
   * Gera Token ID único (UUID v4)
   */
  generateTokenId(): string {
    return uuidv4();
  }

  /**
   * Gera Serial Number legível
   * Formato: ECOT-BR-[ANO]-[CLUSTER]-[SEQUENCIAL]
   * Exemplo: ECOT-BR-2026-CLS001-000123
   */
  generateSerialNumber(
    countryCode: string,
    year: number,
    clusterSequence: string,
    creditSequence: number
  ): string {
    const seq = creditSequence.toString().padStart(6, '0');
    return `ECOT-${countryCode}-${year}-${clusterSequence}-${seq}`;
  }

  /**
   * Cria hash dos dados do certificado para assinatura
   */
  createCertificateHash(certificateData: any): string {
    const dataString = JSON.stringify(certificateData, Object.keys(certificateData).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Assina certificado completo
   */
  signCertificate(certificateData: any, privateKey: string): ISignatureData {
    const dataHash = this.createCertificateHash(certificateData);
    const signature = this.signData(dataHash, privateKey);
    
    // Extrai chave pública da privada (em produção, vem do KMS)
    const publicKey = this.extractPublicKeyFromPrivate(privateKey);
    
    return {
      data: dataHash,
      signature,
      publicKey,
      algorithm: this.algorithm,
      timestamp: new Date()
    };
  }

  /**
   * Verifica certificado completo
   */
  verifyCertificate(
    certificateData: any,
    signature: string,
    publicKey: string
  ): boolean {
    const dataHash = this.createCertificateHash(certificateData);
    return this.verifySignature(dataHash, signature, publicKey);
  }

  /**
   * Extrai chave pública da privada (helper)
   */
  private extractPublicKeyFromPrivate(privateKey: string): string {
    const keyObject = crypto.createPrivateKey(privateKey);
    const publicKey = crypto.createPublicKey(keyObject);
    return publicKey.export({ type: 'spki', format: 'pem' }) as string;
  }

  /**
   * Gera QR Code data para verificação pública
   */
  generateVerificationUrl(tokenId: string, domain: string = 'ecotrust.agropool'): string {
    return `https://${domain}/verify/${tokenId}`;
  }

  /**
   * Cria registro de auditoria para certificado
   */
  createAuditRecord(
    action: string,
    tokenId: string,
    performedBy: string,
    metadata?: any
  ): any {
    return {
      timestamp: new Date(),
      action,
      tokenId,
      performedBy,
      metadata,
      hash: crypto.createHash('sha256')
        .update(JSON.stringify({ action, tokenId, performedBy, metadata, timestamp: new Date() }))
        .digest('hex')
    };
  }
}

export default new CertificateService();
