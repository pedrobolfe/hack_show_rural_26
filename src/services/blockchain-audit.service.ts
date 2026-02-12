import { db } from '../config/firebase.config';

export interface IChainedLog {
  id?: string;
  sequence: number;
  timestamp: Date;
  action: string;
  entityType: 'credit' | 'cluster' | 'property' | 'system';
  entityId: string;
  previousHash: string;
  currentHash: string;
  data: any;
  performedBy: string;
  signature?: string;
}

class BlockchainAuditService {
  private collectionRef = db.collection('blockchain_audit');

  /**
   * Cria hash encadeado
   */
  private createHash(data: any, previousHash: string): string {
    const crypto = require('crypto');
    const content = JSON.stringify({ ...data, previousHash });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Obtém último log da cadeia
   */
  private async getLastLog(): Promise<IChainedLog | null> {
    const snapshot = await this.collectionRef
      .orderBy('sequence', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as IChainedLog;
  }

  /**
   * Adiciona log à cadeia (append-only)
   */
  async appendLog(
    action: string,
    entityType: 'credit' | 'cluster' | 'property' | 'system',
    entityId: string,
    data: any,
    performedBy: string
  ): Promise<IChainedLog> {
    const lastLog = await this.getLastLog();
    const previousHash = lastLog?.currentHash || '0000000000000000000000000000000000000000000000000000000000000000';
    const sequence = lastLog ? lastLog.sequence + 1 : 1;

    const logData = {
      sequence,
      timestamp: new Date(),
      action,
      entityType,
      entityId,
      data,
      performedBy
    };

    const currentHash = this.createHash(logData, previousHash);

    const chainedLog: Omit<IChainedLog, 'id'> = {
      ...logData,
      previousHash,
      currentHash
    };

    const docRef = await this.collectionRef.add(chainedLog);
    const doc = await docRef.get();

    console.log(`⛓️  Log #${sequence} adicionado à cadeia | Hash: ${currentHash.substring(0, 8)}...`);

    return { id: doc.id, ...doc.data() } as IChainedLog;
  }

  /**
   * Verifica integridade da cadeia
   */
  async verifyChainIntegrity(startSequence = 1, limit = 100): Promise<{
    isValid: boolean;
    brokenAt?: number;
    message: string;
  }> {
    const snapshot = await this.collectionRef
      .where('sequence', '>=', startSequence)
      .orderBy('sequence', 'asc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return { isValid: true, message: 'Cadeia vazia' };
    }

    const logs: IChainedLog[] = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() } as IChainedLog);
    });

    // Verificar primeiro log
    if (startSequence === 1 && logs[0].previousHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
      return {
        isValid: false,
        brokenAt: 1,
        message: 'Genesis hash inválido'
      };
    }

    // Verificar encadeamento
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      
      // Recalcular hash
      const logData = {
        sequence: log.sequence,
        timestamp: log.timestamp,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        data: log.data,
        performedBy: log.performedBy
      };
      
      const calculatedHash = this.createHash(logData, log.previousHash);
      
      if (calculatedHash !== log.currentHash) {
        return {
          isValid: false,
          brokenAt: log.sequence,
          message: `Hash divergente no log #${log.sequence}`
        };
      }

      // Verificar encadeamento com próximo
      if (i < logs.length - 1) {
        if (logs[i + 1].previousHash !== log.currentHash) {
          return {
            isValid: false,
            brokenAt: logs[i + 1].sequence,
            message: `Cadeia quebrada entre #${log.sequence} e #${logs[i + 1].sequence}`
          };
        }
      }
    }

    return {
      isValid: true,
      message: `Cadeia válida de #${logs[0].sequence} até #${logs[logs.length - 1].sequence}`
    };
  }

  /**
   * Busca logs de uma entidade específica
   */
  async getEntityHistory(entityId: string, limit = 50): Promise<IChainedLog[]> {
    const snapshot = await this.collectionRef
      .where('entityId', '==', entityId)
      .orderBy('sequence', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const logs: IChainedLog[] = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() } as IChainedLog);
    });

    return logs;
  }
}

export default new BlockchainAuditService();
