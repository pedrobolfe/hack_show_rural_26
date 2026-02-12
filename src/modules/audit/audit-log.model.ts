export type AuditAction = 
  | 'Property_Created'
  | 'Property_Validated'
  | 'Carbon_Calculated'
  | 'Cluster_Created'
  | 'Credits_Issued'
  | 'Credits_Sold'
  | 'Status_Changed'
  | 'Alert_Triggered';

export interface IAuditLog {
  id?: string;
  timestamp: Date;
  action: AuditAction;
  propertyId?: string;
  clusterId?: string;
  previousValue?: any;
  newValue?: any;
  triggeredBy: string;
  metadata?: any;
}

export class AuditLogModel implements IAuditLog {
  id?: string;
  timestamp: Date;
  action: AuditAction;
  propertyId?: string;
  clusterId?: string;
  previousValue?: any;
  newValue?: any;
  triggeredBy: string;
  metadata?: any;

  constructor(data: Partial<IAuditLog>) {
    this.id = data.id;
    this.timestamp = data.timestamp || new Date();
    this.action = data.action!;
    this.propertyId = data.propertyId;
    this.clusterId = data.clusterId;
    this.previousValue = data.previousValue;
    this.newValue = data.newValue;
    this.triggeredBy = data.triggeredBy!;
    this.metadata = data.metadata;
  }

  toFirestore(): Omit<IAuditLog, 'id'> {
    return {
      timestamp: this.timestamp,
      action: this.action,
      propertyId: this.propertyId,
      clusterId: this.clusterId,
      previousValue: this.previousValue,
      newValue: this.newValue,
      triggeredBy: this.triggeredBy,
      metadata: this.metadata
    };
  }
}
