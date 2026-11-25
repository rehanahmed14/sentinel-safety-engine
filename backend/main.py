import os
import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.services.geofence_engine import GeoFenceEngine
from backend.services.audit_logger import ComplianceAuditLogger
from backend.services.telemetry_streamer import TelemetryStreamer

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
GEOJSON_FILE = os.path.join(DATA_DIR, "bengaluru_schools.geojson")
TRAJECTORIES_FILE = os.path.join(DATA_DIR, "bengaluru_trajectories.json")

# Initialize core services
geofence_engine = GeoFenceEngine(GEOJSON_FILE)
audit_logger = ComplianceAuditLogger()
telemetry_streamer = TelemetryStreamer(TRAJECTORIES_FILE, geofence_engine, audit_logger)

# Seed initial system log
audit_logger.add_entry(
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
    message="Sentinel Control Tower Initialized. GeoFence monitoring active for Bengaluru Zone."
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start telemetry streamer background loop
    task = asyncio.create_task(telemetry_streamer.run_loop())
    yield
    task.cancel()

app = FastAPI(
    title="Sentinel Geo-Fence Safety & Compliance Engine API",
    version="1.0.0",
    description="Live telemetry stream & geofence threshold violation intercept engine.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request bodies
class ControlCommand(BaseModel):
    action: str
    params: Optional[Dict[str, Any]] = None

class DispatchWarningRequest(BaseModel):
    unit_id: str
    driver_name: str
    vehicle_id: str
    zone_id: str
    zone_name: str
    speed_mph: float
    speed_kmh: float
    speed_limit_mph: float

class DispatchSupervisorRequest(BaseModel):
    unit_id: str
    driver_name: str
    vehicle_id: str
    zone_id: str
    zone_name: str
    speed_mph: float
    speed_kmh: float
    speed_limit_mph: float

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "system": "Sentinel Geo-Fence Safety & Compliance Engine",
        "city": "Bengaluru, India",
        "active_connections": len(telemetry_streamer.active_connections),
        "total_zones": len(geofence_engine.zones),
        "fleet_size": len(telemetry_streamer.vehicles_data)
    }

@app.get("/api/zones")
def get_zones():
    """Return the GeoJSON polygon collection for all monitored school zones."""
    if not os.path.exists(GEOJSON_FILE):
        raise HTTPException(status_code=404, detail="GeoJSON data not found")
    with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/fleet")
def get_fleet_roster():
    """Return the list of all registered fleet units with drivers and routes."""
    roster = []
    for v in telemetry_streamer.vehicles_data:
        roster.append({
            "unit_id": v["unit_id"],
            "driver_id": v["driver_id"],
            "driver_name": v["driver_name"],
            "vehicle_id": v["vehicle_id"],
            "vehicle_type": v["vehicle_type"],
            "fleet": v["fleet"],
            "assigned_route": v["assigned_route"],
            "total_waypoints": len(v["waypoints"])
        })
    return {"fleet": roster}

@app.get("/api/audit-logs")
def get_audit_logs(limit: int = Query(50, ge=1, le=500), severity: Optional[str] = None):
    """Retrieve the historical feed of flagged compliance events and dispatch actions."""
    logs = audit_logger.get_logs(limit=limit, severity=severity)
    return {
        "total_stored": len(audit_logger.logs),
        "returned": len(logs),
        "logs": logs
    }

@app.get("/api/audit-logs/export")
def export_audit_logs():
    """Export compliance audit logs as CSV."""
    csv_content = audit_logger.export_csv()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sentinel_compliance_audit.csv"}
    )

@app.post("/api/simulation/control")
def control_simulation(cmd: ControlCommand):
    """Control simulation play, pause, speed multiplier, seek, reset."""
    result = telemetry_streamer.handle_command(cmd.action, cmd.params or {})
    return result

@app.post("/api/dispatcher/warning")
def issue_automated_warning(req: DispatchWarningRequest):
    """Trigger automated in-cab speed violation warning."""
    telemetry_streamer.handle_command("issue_warning", req.model_dump())
    return {"status": "SUCCESS", "message": f"In-cab warning successfully delivered to {req.unit_id} ({req.driver_name})"}

@app.post("/api/dispatcher/supervisor")
def dispatch_supervisor(req: DispatchSupervisorRequest):
    """Dispatch patrol supervisor unit to intercept speeding driver."""
    telemetry_streamer.handle_command("dispatch_supervisor", req.model_dump())
    return {"status": "SUCCESS", "message": f"Supervisor unit dispatched to intercept {req.unit_id} ({req.driver_name})"}

@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    await telemetry_streamer.connect(websocket)
    try:
        while True:
            raw_text = await websocket.receive_text()
            try:
                msg = json.loads(raw_text)
                action = msg.get("action")
                params = msg.get("params", {})
                if action:
                    res = telemetry_streamer.handle_command(action, params)
                    # Broadcast updated frame immediately
                    await telemetry_streamer.broadcast_frame()
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        telemetry_streamer.disconnect(websocket)
    except Exception:
        telemetry_streamer.disconnect(websocket)

# ---------------------------------------------------------------------------
# Serve Production Built Frontend (Render / Full-Stack Deployment)
# ---------------------------------------------------------------------------
FRONTEND_DIST = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static")
