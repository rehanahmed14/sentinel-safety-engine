export type VehicleStatus =
  | "SAFE"
  | "APPROACHING_ZONE"
  | "ZONE_COMPLIANT"
  | "CRITICAL_VIOLATION"
  | "WARNING_ISSUED"
  | "SUPERVISOR_DISPATCHED";

export interface GeofenceEvaluation {
  in_zone: boolean;
  is_violation: boolean;
  zone_id: string | null;
  zone_name: string | null;
  speed_limit_mph: number | null;
  speed_limit_kmh: number | null;
  excess_mph: number;
  excess_kmh: number;
  status: VehicleStatus;
  risk_level: "NORMAL" | "HIGH" | "CRITICAL";
  nearest_zone_dist_m: number;
}

export interface VehicleTelemetry {
  unit_id: string;
  driver_id: string;
  driver_name: string;
  vehicle_id: string;
  vehicle_type: string;
  fleet: string;
  assigned_route: string;
  longitude: number;
  latitude: number;
  speed_mph: number;
  speed_kmh: number;
  bearing: number;
  timestamp: string;
  geofence: GeofenceEvaluation;
  status: VehicleStatus;
  warning_sent: boolean;
  supervisor_sent: boolean;
}

export interface CriticalViolationEvent {
  unit_id: string;
  driver_id: string;
  driver_name: string;
  vehicle_id: string;
  vehicle_type: string;
  fleet: string;
  current_speed_mph: number;
  current_speed_kmh: number;
  speed_limit_mph: number;
  speed_limit_kmh: number;
  excess_mph: number;
  excess_kmh: number;
  zone_id: string;
  zone_name: string;
  longitude: number;
  latitude: number;
  warning_sent: boolean;
  supervisor_sent: boolean;
}

export interface TelemetryFrame {
  step: number;
  total_steps: number;
  vehicles: VehicleTelemetry[];
  active_violations: CriticalViolationEvent[];
  recent_audit_logs: Array<{
    id: string;
    timestamp: string;
    iso_timestamp: string;
    event_type: string;
    severity: "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";
    unit_id: string | null;
    driver_name: string | null;
    vehicle_id: string | null;
    zone_id: string | null;
    zone_name: string | null;
    speed_mph: number | null;
    speed_kmh: number | null;
    speed_limit_mph: number | null;
    message: string;
    details?: Record<string, unknown>;
  }>;
}

export interface SimulationMetadata {
  total_steps: number;
  is_playing: boolean;
  speed_multiplier: number;
}
