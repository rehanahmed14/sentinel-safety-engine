export type AuditSeverity = "CRITICAL" | "WARNING" | "INFO" | "SUCCESS";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  iso_timestamp: string;
  event_type: "VIOLATION" | "SAFE_PASS" | "APPROACH" | "WARNING_ISSUED" | "SUPERVISOR_DISPATCHED" | "SYSTEM";
  severity: AuditSeverity;
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
}

export interface DispatchActionPayload {
  unit_id: string;
  driver_name: string;
  vehicle_id: string;
  zone_id: string;
  zone_name: string;
  speed_mph: number;
  speed_kmh: number;
  speed_limit_mph: number;
}
