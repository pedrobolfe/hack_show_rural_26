export type ClusterStatus = 'In_Verification' | 'Certified' | 'Sold' | 'Active';

export interface ICluster {
  id?: string;
  propertyIds: string[];
  totalCarbonCredits: number;
  status: ClusterStatus;
  auditorId?: string;
  cooperativeId?: string;
  createdAt: Date;
  updatedAt: Date;
  certifiedAt?: Date;
}

export class ClusterModel implements ICluster {
  id?: string;
  propertyIds: string[];
  totalCarbonCredits: number;
  status: ClusterStatus;
  auditorId?: string;
  cooperativeId?: string;
  createdAt: Date;
  updatedAt: Date;
  certifiedAt?: Date;

  constructor(data: Partial<ICluster>) {
    this.id = data.id;
    this.propertyIds = data.propertyIds || [];
    this.totalCarbonCredits = data.totalCarbonCredits || 0;
    this.status = data.status || 'In_Verification';
    this.auditorId = data.auditorId;
    this.cooperativeId = data.cooperativeId;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.certifiedAt = data.certifiedAt;
  }

  toFirestore(): Omit<ICluster, 'id'> {
    return {
      propertyIds: this.propertyIds,
      totalCarbonCredits: this.totalCarbonCredits,
      status: this.status,
      auditorId: this.auditorId,
      cooperativeId: this.cooperativeId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      certifiedAt: this.certifiedAt
    };
  }
}
