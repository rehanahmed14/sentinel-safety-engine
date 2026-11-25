import asyncio
import json
import os
from typing import List, Dict, Any, Set
from fastapi import WebSocket
from backend.services.geofence_engine import GeoFenceEngine
from backend.services.audit_logger import ComplianceAuditLogger

class TelemetryStreamer:
    def __init__(
        self,
        trajectories_path: str,
        geofence_engine: GeoFenceEngine,
        audit_logger: ComplianceAuditLogger
    ):
        self.trajectories_path = trajectories_path
        self.geofence_engine = geofence_engine
        self.audit_logger = audit_logger

        self.vehicles_data: List[Dict[str, Any]] = []
        self.active_connections: Set[WebSocket] = set()

        self.current_step = 0
        self.max_steps = 0
        self.is_playing = True
        self.speed_multiplier = 1.0  # 1x, 2x, 5x
        self.base_interval_sec = 1.0

        # State tracking to detect transitions
        # unit_id -> {"last_status": str, "last_zone": str, "warning_sent": bool, "supervisor_sent": bool}
        self.unit_states: Dict[str, Dict[str, Any]] = {}

        self.load_data()

    def load_data(self):
        with open(self.trajectories_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.vehicles_data = data.get("vehicles", [])
        self.max_steps = max(len(v["waypoints"]) for v in self.vehicles_data) if self.vehicles_data else 0
        self.reset_unit_states()

    def reset_unit_states(self):
        self.unit_states = {
            v["unit_id"]: {
                "last_status": "SAFE",
                "last_zone": None,
                "warning_sent": False,
                "supervisor_sent": False,
                "status_override": None
            }
            for v in self.vehicles_data
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        # Send initial full state immediately
        frame = self.generate_current_frame()
        await websocket.send_text(json.dumps({
            "type": "INITIAL_STATE",
            "frame": frame,
            "metadata": {
                "total_steps": self.max_steps,
                "is_playing": self.is_playing,
                "speed_multiplier": self.speed_multiplier
            }
        }))

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    def generate_current_frame(self) -> Dict[str, Any]:
        vehicles_snapshot = []
        critical_violations = []

        for v in self.vehicles_data:
            unit_id = v["unit_id"]
            waypoints = v["waypoints"]
            wp_idx = min(self.current_step, len(waypoints) - 1)
            wp = waypoints[wp_idx]

            lon = wp["longitude"]
            lat = wp["latitude"]
            speed_mph = wp["speed_mph"]
            speed_kmh = wp["speed_kmh"]
            bearing = wp["bearing"]

            eval_res = self.geofence_engine.evaluate_telemetry(lon, lat, speed_mph, speed_kmh)
            state = self.unit_states.get(unit_id, {})

            current_status = eval_res["status"]
            current_zone = eval_res["zone_id"]
            zone_name = eval_res["zone_name"]

            # Check for state transitions and log events
            last_status = state.get("last_status", "SAFE")
            last_zone = state.get("last_zone")

            # Transition into violation
            if current_status == "CRITICAL_VIOLATION":
                if last_status != "CRITICAL_VIOLATION":
                    self.audit_logger.add_entry(
                        event_type="VIOLATION",
                        severity="CRITICAL",
                        unit_id=unit_id,
                        driver_name=v["driver_name"],
                        vehicle_id=v["vehicle_id"],
                        zone_id=current_zone,
                        zone_name=zone_name,
                        speed_mph=speed_mph,
                        speed_kmh=speed_kmh,
                        speed_limit_mph=eval_res["speed_limit_mph"],
                        message=f"CRITICAL SPEED VIOLATION: {unit_id} ({v['driver_name']}) at {speed_mph} MPH in {zone_name} (Limit {eval_res['speed_limit_mph']} MPH)",
                        details={"excess_mph": eval_res["excess_mph"], "route": v["assigned_route"]}
                    )
                critical_violations.append({
                    "unit_id": unit_id,
                    "driver_id": v["driver_id"],
                    "driver_name": v["driver_name"],
                    "vehicle_id": v["vehicle_id"],
                    "vehicle_type": v["vehicle_type"],
                    "fleet": v["fleet"],
                    "current_speed_mph": speed_mph,
                    "current_speed_kmh": speed_kmh,
                    "speed_limit_mph": eval_res["speed_limit_mph"],
                    "speed_limit_kmh": eval_res["speed_limit_kmh"],
                    "excess_mph": eval_res["excess_mph"],
                    "excess_kmh": eval_res["excess_kmh"],
                    "zone_id": current_zone,
                    "zone_name": zone_name,
                    "longitude": lon,
                    "latitude": lat,
                    "warning_sent": state.get("warning_sent", False),
                    "supervisor_sent": state.get("supervisor_sent", False)
                })

            elif current_status == "ZONE_COMPLIANT":
                if last_status != "ZONE_COMPLIANT":
                    self.audit_logger.add_entry(
                        event_type="SAFE_PASS",
                        severity="SUCCESS",
                        unit_id=unit_id,
                        driver_name=v["driver_name"],
                        vehicle_id=v["vehicle_id"],
                        zone_id=current_zone,
                        zone_name=zone_name,
                        speed_mph=speed_mph,
                        speed_kmh=speed_kmh,
                        speed_limit_mph=eval_res["speed_limit_mph"],
                        message=f"{unit_id} ({v['driver_name']}) passed {zone_name} - COMPLIANT ({speed_mph} MPH / Limit {eval_res['speed_limit_mph']} MPH)"
                    )

            state["last_status"] = current_status
            state["last_zone"] = current_zone

            vehicles_snapshot.append({
                "unit_id": unit_id,
                "driver_id": v["driver_id"],
                "driver_name": v["driver_name"],
                "vehicle_id": v["vehicle_id"],
                "vehicle_type": v["vehicle_type"],
                "fleet": v["fleet"],
                "assigned_route": v["assigned_route"],
                "longitude": lon,
                "latitude": lat,
                "speed_mph": speed_mph,
                "speed_kmh": speed_kmh,
                "bearing": bearing,
                "timestamp": wp["timestamp"],
                "geofence": eval_res,
                "status": state.get("status_override") or current_status,
                "warning_sent": state.get("warning_sent", False),
                "supervisor_sent": state.get("supervisor_sent", False)
            })

        return {
            "step": self.current_step,
            "total_steps": self.max_steps,
            "vehicles": vehicles_snapshot,
            "active_violations": critical_violations,
            "recent_audit_logs": self.audit_logger.get_logs(limit=15)
        }

    async def broadcast_frame(self):
        if not self.active_connections:
            return
        frame = self.generate_current_frame()
        payload = json.dumps({
            "type": "TELEMETRY_UPDATE",
            "frame": frame
        })
        disconnected = []
        for ws in self.active_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.active_connections.discard(ws)

    async def run_loop(self):
        while True:
            if self.is_playing:
                await self.broadcast_frame()
                self.current_step += 1
                if self.current_step >= self.max_steps:
                    self.current_step = 0  # Loop simulation
            
            sleep_time = self.base_interval_sec / max(0.2, self.speed_multiplier)
            await asyncio.sleep(sleep_time)

    def handle_command(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if action == "play":
            self.is_playing = True
        elif action == "pause":
            self.is_playing = False
        elif action == "toggle_play":
            self.is_playing = not self.is_playing
        elif action == "set_speed":
            self.speed_multiplier = float(params.get("speed", 1.0))
        elif action == "seek":
            step = int(params.get("step", 0))
            self.current_step = max(0, min(step, self.max_steps - 1))
        elif action == "reset":
            self.current_step = 0
            self.reset_unit_states()
            self.audit_logger.clear()
            self.audit_logger.add_entry(
                event_type="SYSTEM",
                severity="INFO",
                unit_id=None,
                driver_name=None,
                vehicle_id=None,
                zone_id=None,
                zone_name=None,
                speed_mph=None,
                speed_kmh=None,
                speed_limit_mph=None,
                message="Simulation environment reset to initial state (Tick 0)"
            )
        elif action == "issue_warning":
            unit_id = params.get("unit_id")
            if unit_id in self.unit_states:
                self.unit_states[unit_id]["warning_sent"] = True
                self.unit_states[unit_id]["status_override"] = "WARNING_ISSUED"
                driver_name = params.get("driver_name", "Driver")
                zone_name = params.get("zone_name", "School Zone")
                speed = params.get("speed_mph", 0)
                self.audit_logger.add_entry(
                    event_type="WARNING_ISSUED",
                    severity="WARNING",
                    unit_id=unit_id,
                    driver_name=driver_name,
                    vehicle_id=params.get("vehicle_id"),
                    zone_id=params.get("zone_id"),
                    zone_name=zone_name,
                    speed_mph=speed,
                    speed_kmh=params.get("speed_kmh"),
                    speed_limit_mph=params.get("speed_limit_mph"),
                    message=f"IN-CAB WARNING DELIVERED: Audible alert & speed deceleration directive sent to {unit_id} ({driver_name})"
                )
        elif action == "dispatch_supervisor":
            unit_id = params.get("unit_id")
            if unit_id in self.unit_states:
                self.unit_states[unit_id]["supervisor_sent"] = True
                self.unit_states[unit_id]["status_override"] = "SUPERVISOR_DISPATCHED"
                driver_name = params.get("driver_name", "Driver")
                zone_name = params.get("zone_name", "School Zone")
                self.audit_logger.add_entry(
                    event_type="SUPERVISOR_DISPATCHED",
                    severity="CRITICAL",
                    unit_id=unit_id,
                    driver_name=driver_name,
                    vehicle_id=params.get("vehicle_id"),
                    zone_id=params.get("zone_id"),
                    zone_name=zone_name,
                    speed_mph=params.get("speed_mph"),
                    speed_kmh=params.get("speed_kmh"),
                    speed_limit_mph=params.get("speed_limit_mph"),
                    message=f"SUPERVISOR DISPATCHED: Mobile intercept unit en-route to intercept {unit_id} ({driver_name}) at {zone_name}"
                )

        return {
            "status": "ok",
            "is_playing": self.is_playing,
            "speed_multiplier": self.speed_multiplier,
            "current_step": self.current_step
        }
