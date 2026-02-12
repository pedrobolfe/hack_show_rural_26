export interface ICarbonMetric {
  id?: string;
  propertyId: string;
  date: Date;
  ndviScore?: number;
  biomassEstimate?: number;
  carbonSequestrated: number;
  source: string;
  createdAt: Date;
}

export class CarbonMetricModel implements ICarbonMetric {
  id?: string;
  propertyId: string;
  date: Date;
  ndviScore?: number;
  biomassEstimate?: number;
  carbonSequestrated: number;
  source: string;
  createdAt: Date;

  constructor(data: Partial<ICarbonMetric>) {
    this.id = data.id;
    this.propertyId = data.propertyId!;
    this.date = data.date || new Date();
    this.ndviScore = data.ndviScore;
    this.biomassEstimate = data.biomassEstimate;
    this.carbonSequestrated = data.carbonSequestrated!;
    this.source = data.source || 'Sentinel-2';
    this.createdAt = data.createdAt || new Date();
  }

  toFirestore(): Omit<ICarbonMetric, 'id'> {
    return {
      propertyId: this.propertyId,
      date: this.date,
      ndviScore: this.ndviScore,
      biomassEstimate: this.biomassEstimate,
      carbonSequestrated: this.carbonSequestrated,
      source: this.source,
      createdAt: this.createdAt
    };
  }
}
