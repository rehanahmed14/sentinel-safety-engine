export interface SchoolZoneProperties {
  zone_id: string;
  osm_id?: number;
  name: string;
  amenity: string;
  school_type: string;
  speed_limit_kmh: number;
  speed_limit_mph: number;
  risk_level: "HIGH" | "CRITICAL";
  active_hours: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface SchoolZoneFeature {
  type: "Feature";
  id: string;
  properties: SchoolZoneProperties;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface SchoolZoneCollection {
  type: "FeatureCollection";
  metadata: {
    city: string;
    region: string;
    source: string;
    total_zones: number;
    generated_at: string;
  };
  features: SchoolZoneFeature[];
}
