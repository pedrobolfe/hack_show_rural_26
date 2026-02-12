// Process API
export interface ProcessInputBounds {
  bbox: number[];
  properties?: {
    crs: string;
  };
  geometry?: any;
}

export interface ProcessInputData {
  type: string;
  dataFilter?: any;
  processing?: any;
}

export interface ProcessRequestInput {
  bounds: ProcessInputBounds;
  data: ProcessInputData[];
}

export interface ProcessRequestOutput {
  width: number;
  height: number;
  resx?: number;
  resy?: number;
  responses?: {
    identifier: string;
    format: {
      type: string;
    };
  }[];
}

export interface ProcessRequestBody {
  input: ProcessRequestInput;
  output: ProcessRequestOutput;
  evalscript: string;
}

// Catalog API
export interface CatalogSearchRequestBody {
  collections: string[];
  datetime: string;
  bbox?: number[];
  intersects?: any;
  limit?: number;
  filter?: any;
  sortby?: any;
}

export interface StacFeature {
  type: 'Feature';
  stac_version: string;
  id: string;
  properties: any;
  geometry: any;
  links: any[];
  assets: any;
  bbox: number[];
  stac_extensions: string[];
  collection: string;
}

export interface CatalogSearchResponse {
  type: 'FeatureCollection';
  features: StacFeature[];
  links: any[];
  context?: {
    limit: number;
    returned: number;
    next?: number;
  };
}