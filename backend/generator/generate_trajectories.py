import json
import csv
import math
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
GEOJSON_FILE = os.path.join(DATA_DIR, "bengaluru_schools.geojson")
JSON_OUTPUT = os.path.join(DATA_DIR, "bengaluru_trajectories.json")
CSV_OUTPUT = os.path.join(DATA_DIR, "bengaluru_trajectories.csv")

def calculate_bearing(lon1, lat1, lon2, lat2):
    """Calculate forward azimuth in degrees from coordinate 1 to coordinate 2."""
    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    dlon_r = math.radians(lon2 - lon1)
    x = math.sin(dlon_r) * math.cos(lat2_r)
    y = math.cos(lat1_r) * math.sin(lat2_r) - math.sin(lat1_r) * math.cos(lat2_r) * math.cos(dlon_r)
    initial_bearing = math.atan2(x, y)
    initial_bearing = math.degrees(initial_bearing)
    return (initial_bearing + 360) % 360

def interpolate_segment(p1, p2, num_steps):
    coords = []
    for i in range(num_steps):
        t = i / float(num_steps)
        lon = p1[0] + t * (p2[0] - p1[0])
        lat = p1[1] + t * (p2[1] - p1[1])
        coords.append([lon, lat])
    return coords

def build_vehicle_path(keypoints, speeds_kmh, vehicle_meta, start_time):
    """
    Interpolate keypoints into a smooth high-frequency telemetry sequence.
    """
    waypoints = []
    current_time = start_time
    total_distance_km = 0.0

    for i in range(len(keypoints) - 1):
        pt_a = keypoints[i]
        pt_b = keypoints[i+1]
        speed_kmh = speeds_kmh[min(i, len(speeds_kmh) - 1)]
        speed_mph = round(speed_kmh * 0.621371, 1)

        # Approximate distance in km
        dx = (pt_b[0] - pt_a[0]) * 111.32 * math.cos(math.radians(pt_a[1]))
        dy = (pt_b[1] - pt_a[1]) * 110.574
        dist_km = math.sqrt(dx*dx + dy*dy)
        
        # Determine number of 1-second sample points
        speed_kms = (speed_kmh / 3600.0) if speed_kmh > 0 else 0.005
        steps = max(3, int(dist_km / speed_kms)) if speed_kms > 0 else 5
        steps = min(steps, 25) # keep reasonable cadence

        segment_coords = interpolate_segment(pt_a, pt_b, steps)

        for j in range(len(segment_coords)):
            curr_coord = segment_coords[j]
            next_coord = segment_coords[j+1] if j+1 < len(segment_coords) else pt_b
            bearing = calculate_bearing(curr_coord[0], curr_coord[1], next_coord[0], next_coord[1])
            
            # Add subtle natural speed variation (+- 1 km/h)
            var_speed = speed_kmh + (0.5 if j % 2 == 0 else -0.5)
            var_mph = round(var_speed * 0.621371, 1)

            waypoints.append({
                "timestamp": current_time.isoformat() + "Z",
                "seconds_offset": len(waypoints),
                "longitude": round(curr_coord[0], 6),
                "latitude": round(curr_coord[1], 6),
                "speed_kmh": round(var_speed, 1),
                "speed_mph": var_mph,
                "bearing": round(bearing, 1),
                "altitude_m": 920.0
            })
            current_time += timedelta(seconds=1)
            total_distance_km += dist_km / steps

    return {
        "unit_id": vehicle_meta["unit_id"],
        "driver_id": vehicle_meta["driver_id"],
        "driver_name": vehicle_meta["driver_name"],
        "vehicle_id": vehicle_meta["vehicle_id"],
        "vehicle_type": vehicle_meta["vehicle_type"],
        "fleet": vehicle_meta["fleet"],
        "assigned_route": vehicle_meta["route_name"],
        "planned_violation": vehicle_meta.get("planned_violation", False),
        "total_waypoints": len(waypoints),
        "waypoints": waypoints
    }

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    start_time = datetime(2026, 11, 19, 14, 2, 0)

    # Unit 1: Marcus Johnson - Moves from MG Road through St. Mark's Road straight through
    # Bishop Cotton Boys' School zone (77.6001-77.6025, 12.9708-12.9731).
    # Reaches 32 MPH (51.5 KM/H) inside the 15 MPH zone!
    unit1_meta = {
        "unit_id": "UNIT-01",
        "driver_id": "DRV-101",
        "driver_name": "Marcus Johnson",
        "vehicle_id": "KA-01-MJ-8820",
        "vehicle_type": "Ford Transit Electric",
        "fleet": "SwiftDrop Express",
        "route_name": "Route 4 - St. Mark's Corridor",
        "planned_violation": True
    }
    unit1_keypoints = [
        [77.6080, 12.9750], # MG Road Metro
        [77.6050, 12.9745], # Anil Kumble Circle
        [77.6030, 12.9735], # Museum Rd junction
        [77.6015, 12.9725], # INSIDE Bishop Cotton Boys' School Zone (Zone 001)
        [77.6010, 12.9715], # INSIDE Bishop Cotton Boys' School Zone - SPEEDING!
        [77.6012, 12.9695], # Near Residency Road Junction
        [77.6025, 12.9688], # Inside Bishop Cotton Girls' Zone (Zone 002)
        [77.6040, 12.9660], # Richmond Circle
        [77.6035, 12.9640]  # Hosur Road
    ]
    # Speeds: normal 42 km/h, accelerates to 51.5 km/h (32 mph) inside zone 1, drops to 20 km/h in zone 2
    unit1_speeds = [42.0, 44.0, 48.0, 51.5, 52.0, 38.0, 22.0, 36.0, 40.0]

    # Unit 2: Aarav Sharma - Safe compliant driver through Ashok Nagar / Museum Road
    unit2_meta = {
        "unit_id": "UNIT-02",
        "driver_id": "DRV-102",
        "driver_name": "Aarav Sharma",
        "vehicle_id": "KA-04-AS-4091",
        "vehicle_type": "Tata Ace EV",
        "fleet": "Apex Parcel Courier",
        "route_name": "Route 7 - Museum Rd & Lavelle",
        "planned_violation": False
    }
    unit2_keypoints = [
        [77.5980, 12.9760], # Cubbon Park exit
        [77.6010, 12.9750], # Kasturba Road
        [77.6035, 12.9736], # Entering St. Joseph's Boys' Zone (Zone 003) - SLOWS DOWN!
        [77.6040, 12.9730], # Inside Zone 003 at safe 20 km/h (12.4 mph)
        [77.6045, 12.9715], # Exiting Zone
        [77.6060, 12.9690], # Brigade Road junction
        [77.6080, 12.9670]  # Shanthala Nagar
    ]
    unit2_speeds = [38.0, 35.0, 21.0, 19.5, 22.0, 38.0, 40.0]

    # Unit 3: Priya Patel - Indiranagar Corridor near National Public School
    unit3_meta = {
        "unit_id": "UNIT-03",
        "driver_id": "DRV-103",
        "driver_name": "Priya Patel",
        "vehicle_id": "KA-03-PP-2104",
        "vehicle_type": "Mercedes Sprinter",
        "fleet": "UrbanFleet Express",
        "route_name": "Route 12 - Indiranagar 100ft Rd",
        "planned_violation": False
    }
    unit3_keypoints = [
        [77.6380, 12.9780], # CMH Road
        [77.6400, 12.9740], # 100 Ft Road
        [77.6430, 12.9702], # Near National Public School (Zone 004) - Slows down
        [77.6435, 12.9692], # Inside Zone 004 at 23 km/h
        [77.6440, 12.9650], # Domlur Flyover approach
        [77.6450, 12.9610]  # EGL Inner Ring Rd
    ]
    unit3_speeds = [45.0, 42.0, 24.0, 22.5, 48.0, 52.0]

    # Unit 4: Vikram Rao - Koramangala 4th Block near Bethany High School
    # Violates speed limit at 49.5 km/h (30.8 mph) in 25 km/h zone
    unit4_meta = {
        "unit_id": "UNIT-04",
        "driver_id": "DRV-104",
        "driver_name": "Vikram Rao",
        "vehicle_id": "KA-05-VR-5519",
        "vehicle_type": "Ashok Leyland Bada Dost",
        "fleet": "MetroCargo Trans",
        "route_name": "Route 9 - Koramangala Sector 4",
        "planned_violation": True
    }
    unit4_keypoints = [
        [77.6180, 12.9380], # Sony World Signal
        [77.6210, 12.9365], # 80ft Road
        [77.6248, 12.9349], # INSIDE Bethany High School Zone (Zone 005) - SPEEDING!
        [77.6258, 12.9344], # Inside Zone 005 at 49.5 km/h!
        [77.6290, 12.9330], # Maharaja Signal
        [77.6320, 12.9310]  # Ejipura road
    ]
    unit4_speeds = [40.0, 46.0, 49.5, 48.0, 35.0, 42.0]

    # Unit 5: Kavita Reddy - Halasuru (Ulsoor) route near Frank Anthony Public School
    unit5_meta = {
        "unit_id": "UNIT-05",
        "driver_id": "DRV-105",
        "driver_name": "Kavita Reddy",
        "vehicle_id": "KA-02-KR-1048",
        "vehicle_type": "Mahindra Treo Cargo EV",
        "fleet": "Zenith EcoLogistics",
        "route_name": "Route 3 - Ulsoor Lake & Cambridge Rd",
        "planned_violation": False
    }
    unit5_keypoints = [
        [77.6190, 12.9780], # Ulsoor Lake
        [77.6215, 12.9755], # Kensington Road
        [77.6242, 12.9733], # Inside Frank Anthony Zone (Zone 006) - Compliant 21 km/h
        [77.6250, 12.9725], # Exiting zone
        [77.6270, 12.9700], # Old Madras Road
        [77.6290, 12.9670]  # Murphy Town
    ]
    unit5_speeds = [34.0, 32.0, 21.0, 20.0, 38.0, 40.0]

    vehicles = [
        build_vehicle_path(unit1_keypoints, unit1_speeds, unit1_meta, start_time),
        build_vehicle_path(unit2_keypoints, unit2_speeds, unit2_meta, start_time),
        build_vehicle_path(unit3_keypoints, unit3_speeds, unit3_meta, start_time),
        build_vehicle_path(unit4_keypoints, unit4_speeds, unit4_meta, start_time),
        build_vehicle_path(unit5_keypoints, unit5_speeds, unit5_meta, start_time)
    ]

    # Save to JSON
    output_payload = {
        "metadata": {
            "city": "Bengaluru",
            "region": "Karnataka, India",
            "format": "Sentinel High-Frequency GPS Telemetry",
            "frequency_hz": 1,
            "total_fleet_units": len(vehicles),
            "generated_at": datetime.utcnow().isoformat() + "Z"
        },
        "vehicles": vehicles
    }

    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output_payload, f, indent=2)

    # Save flattened CSV (matching Kaggle Taxi / GeoLife format)
    with open(CSV_OUTPUT, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "timestamp", "unit_id", "driver_id", "driver_name", "vehicle_id",
            "longitude", "latitude", "speed_kmh", "speed_mph", "bearing", "altitude_m"
        ])
        for v in vehicles:
            for wp in v["waypoints"]:
                writer.writerow([
                    wp["timestamp"], v["unit_id"], v["driver_id"], v["driver_name"], v["vehicle_id"],
                    wp["longitude"], wp["latitude"], wp["speed_kmh"], wp["speed_mph"], wp["bearing"], wp["altitude_m"]
                ])

    print(f"Successfully generated {len(vehicles)} vehicle tracks with total {sum(len(v['waypoints']) for v in vehicles)} waypoints.")
    print(f"Saved to {JSON_OUTPUT} and {CSV_OUTPUT}")

if __name__ == "__main__":
    main()
