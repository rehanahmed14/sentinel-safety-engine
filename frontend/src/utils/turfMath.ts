import * as turf from "@turf/turf";
import type { SchoolZoneCollection, SchoolZoneFeature } from "../types/geofence";

export interface SpatialZoneResult {
  inside: boolean;
  zone: SchoolZoneFeature | null;
  speedLimitMph: number | null;
  speedLimitKmh: number | null;
  zoneName: string | null;
}

export function checkPointInSchoolZones(
  longitude: number,
  latitude: number,
  zonesCollection: SchoolZoneCollection | null
): SpatialZoneResult {
  if (!zonesCollection || !zonesCollection.features) {
    return {
      inside: false,
      zone: null,
      speedLimitMph: null,
      speedLimitKmh: null,
      zoneName: null
    };
  }

  const pt = turf.point([longitude, latitude]);

  for (const zone of zonesCollection.features) {
    if (zone.geometry && zone.geometry.type === "Polygon") {
      const poly = turf.polygon(zone.geometry.coordinates);
      const isInside = turf.booleanPointInPolygon(pt, poly);
      if (isInside) {
        return {
          inside: true,
          zone,
          speedLimitMph: zone.properties.speed_limit_mph,
          speedLimitKmh: zone.properties.speed_limit_kmh,
          zoneName: zone.properties.name
        };
      }
    }
  }

  return {
    inside: false,
    zone: null,
    speedLimitMph: null,
    speedLimitKmh: null,
    zoneName: null
  };
}
