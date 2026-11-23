import json
import math
from typing import List, Dict, Any, Optional, Tuple

class GeoFenceEngine:
    def __init__(self, geojson_path: str):
        self.geojson_path = geojson_path
        self.zones: List[Dict[str, Any]] = []
        self.load_zones()

    def load_zones(self):
        with open(self.geojson_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.zones = data.get("features", [])

    @staticmethod
    def point_in_polygon(lon: float, lat: float, polygon_coords: List[List[float]]) -> bool:
        """
        Ray-casting algorithm to determine if a point (lon, lat) is inside a polygon.
        polygon_coords is a list of [lon, lat] points forming the exterior ring.
        """
        inside = False
        n = len(polygon_coords)
        if n < 3:
            return False

        p1_lon, p1_lat = polygon_coords[0]
        for i in range(1, n + 1):
            p2_lon, p2_lat = polygon_coords[i % n]
            if lat > min(p1_lat, p2_lat):
                if lat <= max(p1_lat, p2_lat):
                    if lon <= max(p1_lon, p2_lon):
                        if p1_lat != p2_lat:
                            x_inters = (lat - p1_lat) * (p2_lon - p1_lon) / (p2_lat - p1_lat) + p1_lon
                        if p1_lon == p2_lon or lon <= x_inters:
                            inside = not inside
            p1_lon, p1_lat = p2_lon, p2_lat

        return inside

    @staticmethod
    def haversine_distance_meters(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
        """Calculate distance between two coordinates in meters."""
        r = 6371000  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    def evaluate_telemetry(self, lon: float, lat: float, speed_mph: float, speed_kmh: float) -> Dict[str, Any]:
        """
        Evaluate if a point is inside or approaching any school zone,
        and whether it triggers a speed violation.
        """
        inside_zone: Optional[Dict[str, Any]] = None
        min_dist_to_zone: float = float("inf")
        nearest_zone: Optional[Dict[str, Any]] = None

        for zone in self.zones:
            geom = zone.get("geometry", {})
            props = zone.get("properties", {})
            if geom.get("type") == "Polygon":
                coords = geom.get("coordinates", [])[0]
                if self.point_in_polygon(lon, lat, coords):
                    inside_zone = zone
                    break
                else:
                    # Estimate distance to zone centroid/first vertex
                    dist = self.haversine_distance_meters(lon, lat, coords[0][0], coords[0][1])
                    if dist < min_dist_to_zone:
                        min_dist_to_zone = dist
                        nearest_zone = zone

        if inside_zone:
            props = inside_zone.get("properties", {})
            limit_mph = props.get("speed_limit_mph", 15)
            limit_kmh = props.get("speed_limit_kmh", 25)
            is_violation = speed_mph > limit_mph

            return {
                "in_zone": True,
                "is_violation": is_violation,
                "zone_id": props.get("zone_id"),
                "zone_name": props.get("name"),
                "speed_limit_mph": limit_mph,
                "speed_limit_kmh": limit_kmh,
                "excess_mph": max(0.0, round(speed_mph - limit_mph, 1)),
                "excess_kmh": max(0.0, round(speed_kmh - limit_kmh, 1)),
                "status": "CRITICAL_VIOLATION" if is_violation else "ZONE_COMPLIANT",
                "risk_level": props.get("risk_level", "HIGH"),
                "nearest_zone_dist_m": 0.0
            }
        elif nearest_zone and min_dist_to_zone < 180.0:
            props = nearest_zone.get("properties", {})
            return {
                "in_zone": False,
                "is_violation": False,
                "zone_id": props.get("zone_id"),
                "zone_name": props.get("name"),
                "speed_limit_mph": props.get("speed_limit_mph", 15),
                "speed_limit_kmh": props.get("speed_limit_kmh", 25),
                "excess_mph": 0.0,
                "excess_kmh": 0.0,
                "status": "APPROACHING_ZONE",
                "risk_level": props.get("risk_level", "HIGH"),
                "nearest_zone_dist_m": round(min_dist_to_zone, 1)
            }
        else:
            return {
                "in_zone": False,
                "is_violation": False,
                "zone_id": None,
                "zone_name": None,
                "speed_limit_mph": None,
                "speed_limit_kmh": None,
                "excess_mph": 0.0,
                "excess_kmh": 0.0,
                "status": "SAFE",
                "risk_level": "NORMAL",
                "nearest_zone_dist_m": round(min_dist_to_zone, 1) if min_dist_to_zone != float("inf") else 999.0
            }
