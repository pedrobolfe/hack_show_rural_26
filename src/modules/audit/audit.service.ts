import { db } from '../../config/firebase.config';
import { AuditLogModel, IAuditLog } from './audit-log.model';

class AuditService {
  private collectionRef = db.collection('audit_logs');

  async log(data: Partial<IAuditLog>): Promise<AuditLogModel> {
    const auditLog = new AuditLogModel(data);
    
    const docRef = await this.collectionRef.add(auditLog.toFirestore());
    const doc = await docRef.get();
    
    return new AuditLogModel({ id: doc.id, ...doc.data() });
  }

  async findByProperty(propertyId: string, limit = 50): Promise<AuditLogModel[]> {
    const snapshot = await this.collectionRef
      .where('propertyId', '==', propertyId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const logs: AuditLogModel[] = [];
    snapshot.forEach(doc => {
      logs.push(new AuditLogModel({ id: doc.id, ...doc.data() }));
    });

    return logs;
  }

  async findByCluster(clusterId: string, limit = 50): Promise<AuditLogModel[]> {
    const snapshot = await this.collectionRef
      .where('clusterId', '==', clusterId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const logs: AuditLogModel[] = [];
    snapshot.forEach(doc => {
      logs.push(new AuditLogModel({ id: doc.id, ...doc.data() }));
    });

    return logs;
  }
}

export default new AuditService();
