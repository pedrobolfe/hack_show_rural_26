export type PropertyStatus = 'Active' | 'Pending' | 'Alert';

export interface IAreaDetails {
  total: number;
  forest: number;
  app: number;
  productive: number;
  legalReserve?: number;
}

export interface ICarData {
  number: string;
  legalReserve?: number;
  app?: number;
  validated: boolean;
  validatedAt?: Date;
}

export interface ILocation {
  city: string;
  state: string;
  center: {
    lat: number;
    lng: number;
  };
}

export interface IPooling {
  isInCluster: boolean;
  clusterId?: string;
}

export interface IProperty {
  id?: string;
  ownerId: string;
  carData: ICarData;
  location: ILocation;
  status: PropertyStatus;
  areaDetails: IAreaDetails;
  geoJson?: any;
  pooling: IPooling;
  currentCarbonStock?: number;
  lastSatelliteAnalysis?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyModel implements IProperty {
  id?: string;
  ownerId: string;
  carData: ICarData;
  location: ILocation;
  status: PropertyStatus;
  areaDetails: IAreaDetails;
  geoJson?: any;
  pooling: IPooling;
  currentCarbonStock?: number;
  lastSatelliteAnalysis?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IProperty>) {
    this.id = data.id;
    this.ownerId = data.ownerId!;
    this.carData = data.carData!;
    this.location = data.location!;
    this.status = data.status || 'Pending';
    this.areaDetails = data.areaDetails!;
    this.geoJson = data.geoJson;
    this.pooling = data.pooling || { isInCluster: false };
    this.currentCarbonStock = data.currentCarbonStock;
    this.lastSatelliteAnalysis = data.lastSatelliteAnalysis;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.ownerId) {
      errors.push('OwnerId é obrigatório');
    }

    if (!this.carData?.number) {
      errors.push('Número do CAR é obrigatório');
    }

    if (!this.location?.city || !this.location?.state) {
      errors.push('Localização completa é obrigatória');
    }

    if (!this.areaDetails?.total || this.areaDetails.total <= 0) {
      errors.push('Área total deve ser maior que zero');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toFirestore(): Omit<IProperty, 'id'> {
    return {
      ownerId: this.ownerId,
      carData: this.carData,
      location: this.location,
      status: this.status,
      areaDetails: this.areaDetails,
      geoJson: this.geoJson,
      pooling: this.pooling,
      currentCarbonStock: this.currentCarbonStock,
      lastSatelliteAnalysis: this.lastSatelliteAnalysis,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
