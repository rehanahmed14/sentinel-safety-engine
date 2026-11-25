import csv
import io
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

class ComplianceAuditLogger:
    def __init__(self):
        self.logs: List[Dict[str, Any]] = []
        self._counter: int = 1

    def add_entry(
        self,
        event_type: str, # "VIOLATION" | "SAFE_PASS" | "APPROACH" | "WARNING_ISSUED" | "SUPERVISOR_DISPATCHED" | "SYSTEM"
        severity: str,   # "CRITICAL" | "WARNING" | "INFO" | "SUCCESS"
        unit_id: Optional[str],
        driver_name: Optional[str],
        vehicle_id: Optional[str],
        zone_id: Optional[str],
        zone_name: Optional[str],
        speed_mph: Optional[float],
        speed_kmh: Optional[float],
        speed_limit_mph: Optional[float],
        message: str,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        entry_id = f"AUD-{self._counter:05d}"
        self._counter += 1
        now = datetime.now()
        timestamp_str = now.strftime("%H:%M:%S")
        iso_timestamp = now.isoformat()

        entry = {
            "id": entry_id,
            "timestamp": timestamp_str,
            "iso_timestamp": iso_timestamp,
            "event_type": event_type,
            "severity": severity,
            "unit_id": unit_id,
            "driver_name": driver_name,
            "vehicle_id": vehicle_id,
            "zone_id": zone_id,
            "zone_name": zone_name,
            "speed_mph": speed_mph,
            "speed_kmh": speed_kmh,
            "speed_limit_mph": speed_limit_mph,
            "message": message,
            "details": details or {}
        }
        # Prepend so newest is first
        self.logs.insert(0, entry)
        # Cap memory at 1000 items
        if len(self.logs) > 1000:
            self.logs.pop()
        return entry

    def get_logs(self, limit: int = 100, severity: Optional[str] = None) -> List[Dict[str, Any]]:
        filtered = self.logs
        if severity:
            filtered = [l for l in filtered if l["severity"] == severity]
        return filtered[:limit]

    def export_csv(self) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Audit ID", "Timestamp", "ISO Timestamp", "Event Type", "Severity",
            "Unit ID", "Driver Name", "Vehicle ID", "Zone ID", "Zone Name",
            "Speed (MPH)", "Speed (KM/H)", "Speed Limit (MPH)", "Message"
        ])
        for log in self.logs:
            writer.writerow([
                log["id"], log["timestamp"], log["iso_timestamp"], log["event_type"], log["severity"],
                log["unit_id"], log["driver_name"], log["vehicle_id"], log["zone_id"], log["zone_name"],
                log["speed_mph"], log["speed_kmh"], log["speed_limit_mph"], log["message"]
            ])
        return output.getvalue()

    def clear(self):
        self.logs.clear()
        self._counter = 1
