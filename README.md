# Sentinel: Geo-Fence Safety & Compliance Engine

> Real-time commercial fleet telemetry ingestion, spatial geo-fencing, and automated speed compliance intercept engine designed for institutional school and college safety zones across Bengaluru, India.

---

## 📌 Executive Summary & Problem Statement

Commercial delivery drivers (3PL carriers such as Amazon Logistics, Delhivery, Blue Dart, Shadowfax, and Ecom Express) operating under strict delivery time windows frequently exceed speed limits in residential neighborhoods and school zones. 

Traditional fleet management systems rely on **post-trip retrospective batch reporting**, rendering it impossible for dispatchers to intervene during an active violation. **School Zone Sentinel** eliminates this gap by providing an end-to-end, sub-second telemetry ingestion pipeline that cross-references live vehicle GPS traces against high-precision geo-fenced safety zones, flagging infractions in real time and enabling immediate in-cab driver warnings and supervisor dispatch.

Inspired by modern urban mobility interfaces (**Uber, Rapido, and Namma Yatri**), the dashboard prioritizes an **edge-to-edge full-bleed hero map** with floating frosted-glass controls, collapsible fleet navigators, an Uber-style bottom driver sheet, and a slide-over compliance audit feed—completely eliminating intrusive popups.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Data Layer
        GJ[("53 Institutional Zones<br/>(bengaluru_schools.geojson)")]
        TRJ[("629 Commercial Waypoints<br/>(bengaluru_trajectories.json)")]
    end

    subgraph Backend Engine [FastAPI Telemetry Server :8000]
        GE["GeoFenceEngine<br/>(Ray-Casting Point-in-Polygon & Haversine)"]
        AL["ComplianceAuditLogger<br/>(In-Memory Store & CSV Exporter)"]
        TS["TelemetryStreamer<br/>(Async Broadcast Loop @ 1 Hz)"]
        WSS["WebSocket Telemetry Stream<br/>(/ws/telemetry)"]
        REST["REST API Endpoints<br/>(/api/health, /api/zones, /api/audit-logs)"]
    end

    subgraph Frontend Client [React 19 + TypeScript + Vite :5173]
        WS["useTelemetryStream Hook<br/>(Resilient Auto-Reconnect Client)"]
        GM["GoogleSentinelMap<br/>(60 FPS Lerp & Quaternion-Heading Bearing)"]
        FH["FloatingHeader Capsule<br/>(Brand, Live Status, Audio Toggle)"]
        FC["FloatingFleetCard<br/>(Search & 3PL Carrier Filters)"]
        RS["DriverRideSheet<br/>(Uber-Style Bottom Focus & Follow Camera)"]
        CD["ComplianceDrawer<br/>(Slide-Over Audit Feed & CSV Export)"]
    end

    GJ --> GE
    TRJ --> TS
    TS --> GE
    GE -->|"Evaluate Speed vs. Limit"| AL
    TS --> WSS
    WSS <-->|"Bidirectional JSON Frames"| WS
    REST <-->|"HTTP GET / POST"| WS
    WS --> GM
    WS --> RS
    WS --> FC
    WS --> CD
```

---

## ⚡ Key Capabilities & Engineering Highlights

### 1. Full-Screen Google Maps Hero Viewport
* **Edge-to-Edge Navigation**: The map spans 100% of the viewport with a custom dark-mode vector palette (`#09090b` obsidian styling) tuned for high contrast.
* **Pre-connected & Asynchronous**: Pre-connects to Google Maps CDN and loads via `v=quarterly` edge caching, achieving instant initial render.
* **60 FPS Continuous Marker Lerp**: High-frequency `requestAnimationFrame` delta-interpolation guarantees smooth vehicle movement and rotational bearing alignment without stepped teleportation.

### 2. Comprehensive Institutional Dataset (53 Bengaluru Zones)
* **26 Premier Colleges & Universities** (styled in Cyan `#06b6d4`):
  * *Indian Institute of Science (IISc), RV College of Engineering (RVCE), PES University, BMS College of Engineering, M.S. Ramaiah Institute of Technology (MSRIT), Christ University, Mount Carmel College, St. Joseph's University, Bangalore Medical College (BMCRI), St. John's Medical College, NLSIU Nagarbhavi, IIIT Bangalore, UVCE KR Circle, and more.*
* **27 Renowned K-12 Schools** (styled in Purple `#a855f7`):
  * *Bishop Cotton Boys' School, Bishop Cotton Girls' School, St. Joseph's Boys' High School, National Public School (Indiranagar, Koramangala, Rajajinagar), Bethany High School, Frank Anthony Public School, Army Public School, Baldwin Boys' High School, TISB, Greenwood High, Inventure Academy, and more.*
* **Enforced Speed Threshold**: Mandatory **15 MPH (25 km/h)** pedestrian safety zone ceiling.

### 3. Five Commercial 3PL Fleet Units
* **Amazon Logistics** (`UNIT-01`, Marcus Johnson, Ashok Nagar / Richmond Town corridor)
* **Delhivery Express** (`UNIT-02`, Aarav Sharma, Central CBD / MG Road corridor)
* **Blue Dart Express** (`UNIT-03`, Priya Patel, Indiranagar / Old Airport Road corridor)
* **Shadowfax Fleet** (`UNIT-04`, Vikram Rao, Koramangala corridor)
* **Ecom Express** (`UNIT-05`, Kavita Reddy, Halasuru / Ulsoor corridor)

### 4. Non-Intrusive Violation Handling (Zero Popups)
* **No Blocking Modals**: When a speed threshold violation occurs, the vehicle chevron marker and institutional polygon pulse crimson red (`#ff3366`).
* **Silent Audit Logging**: The event is quietly recorded into the compliance audit log with exact coordinates, excess speed, timestamp, and risk severity.
* **Active Camera Chase**: The Google Maps camera smoothly tracks the active vehicle without disrupting dispatcher control.

### 5. Uber-Inspired Control Tower UI
* **Floating Header**: Minimal frosted-glass capsule displaying live WebSocket connection state, simulation quick-trigger, audio mute toggle, and audit drawer launcher.
* **Collapsible Fleet Navigator**: Sits cleanly on the left; can be collapsed to a compact badge (`[ 👥 Active Fleet (5) ]`) with 1 click. Includes search by Driver Name/ID and 3PL Carrier dropdown.
* **Driver Ride Sheet**: Slides up from the bottom when any vehicle is tapped, showing avatar initials, license plate, speed readout, and a 1-tap **`[TRACKING / FREE CAM]`** lock button.
* **Slide-Over Compliance Drawer**: Slides out from the right on demand with severity filters (`CRITICAL`, `WARNING`, `INFO`) and a one-click **`EXPORT CSV`** button.

---

## 🧮 Mathematical & Spatial Algorithms

### 1. Ray-Casting Point-in-Polygon (PIP)
The engine executes a high-speed Jordan Curve ray-casting algorithm to determine if a point $(x, y)$ falls inside polygon $P$:

$$\text{inside} = \bigoplus_{i=1}^{n} \left[ (y_i > y \neq y_{i+1} > y) \land \left( x < \frac{(x_{i+1} - x_i)(y - y_i)}{y_{i+1} - y_i} + x_i \right) \right]$$

* **Worst-Case Complexity**: $\mathcal{O}(n)$ per polygon (where $n$ is the number of vertices).
* **Execution Location**: Executed concurrently in Python FastAPI and verified client-side.

### 2. Haversine Great-Circle Proximity Calculation
Used to compute proximity distance $d$ (in meters) when vehicles approach within a 180-meter buffer zone:

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c \quad \text{where } R = 6{,}371{,}000\text{ meters}$$

### 3. Threshold Evaluation Logic
```python
if vehicle_inside_zone:
    if vehicle_speed_mph > zone_speed_limit_mph:
        status = "CRITICAL_VIOLATION"
        severity = "CRITICAL"
    else:
        status = "ZONE_COMPLIANT"
        severity = "INFO"
elif nearest_zone_distance_meters < 180.0:
    status = "APPROACHING_ZONE"
    severity = "WARNING"
else:
    status = "EN_ROUTE"
```

---

## 📂 Project Structure

```
SDC/
├── backend/
│   ├── data/
│   │   ├── bengaluru_schools.geojson       # 53 Institutional polygons with metadata
│   │   ├── bengaluru_trajectories.json      # 5 Commercial fleet trajectories (629 waypoints)
│   │   └── bengaluru_trajectories.csv       # Tabular trajectory format
│   ├── generator/
│   │   ├── fetch_osm_schools.py            # OpenStreetMap Overpass API extractor
│   │   ├── generate_trajectories.py        # Real-world waypoint and bearing generator
│   │   └── populate_bengaluru_institutions.py # 53 Zone compiler & builder
│   ├── services/
│   │   ├── audit_logger.py                 # Thread-safe in-memory audit store & CSV exporter
│   │   ├── geofence_engine.py              # Ray-casting & Haversine spatial evaluator
│   │   └── telemetry_streamer.py           # Async broadcast loop & client command dispatcher
│   └── main.py                             # FastAPI application, CORS, and WebSocket router
├── frontend/
│   ├── public/
│   │   └── data/
│   │       ├── bengaluru_schools.geojson   # Synced client-side zone polygons
│   │       └── bengaluru_trajectories.json  # Synced route trajectories
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConnectionStatus.tsx    # Live WebSocket status badge
│   │   │   │   └── StatusChip.tsx          # Compliance status pill
│   │   │   ├── feed/
│   │   │   │   └── ComplianceDrawer.tsx    # Slide-over audit feed drawer with CSV export
│   │   │   ├── fleet/
│   │   │   │   ├── DriverRideSheet.tsx     # Uber-style bottom driver focus sheet
│   │   │   │   └── FloatingFleetCard.tsx   # Collapsible fleet navigator with 3PL carrier filter
│   │   │   ├── layout/
│   │   │   │   ├── FloatingHeader.tsx      # Minimal frosted-glass top navigation capsule
│   │   │   │   └── ModernControlTowerLayout.tsx # Edge-to-edge layout orchestrator
│   │   │   └── map/
│   │   │       ├── GoogleSentinelMap.tsx   # 60 FPS Google Maps live tracking engine
│   │   │       └── MapHUD.tsx              # Floating Zones/Routes visibility toggles & Recenter
│   │   ├── hooks/
│   │   │   └── useTelemetryStream.ts       # Reactive WebSocket telemetry management hook
│   │   ├── services/
│   │   │   └── websocket.ts                # Auto-reconnecting WebSocket client
│   │   ├── types/
│   │   │   ├── audit.ts                    # TypeScript interfaces for audit logs & dispatch
│   │   │   ├── geofence.ts                 # GeoJSON polygon feature definitions
│   │   │   └── telemetry.ts                # Live vehicle state & violation types
│   │   ├── utils/
│   │   │   ├── audio.ts                    # Synthesized acoustic warning audio manager
│   │   │   └── googleMapsDarkStyle.ts      # Custom Google Maps dark theme palette
│   │   ├── App.tsx                         # Root component
│   │   ├── index.css                       # Frosted glass, tailwind imports & CSS animations
│   │   └── main.tsx                        # React DOM root entry
│   ├── .env                                # Google Maps API key configuration
│   ├── index.html                          # Pre-connected Google Maps HTML shell
│   ├── package.json                        # Dependencies (React 19, TypeScript, Lucide, etc.)
│   ├── tsconfig.json                       # Root TypeScript config
│   └── vite.config.ts                      # Vite build configuration
├── PRD.md                                  # Product Requirements Document
├── ai_slops.md                             # Anti-slop engineering design manifesto
├── start_all.bat                           # Unified Windows one-click launcher
└── README.md                               # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
* **Python**: `3.10` or higher
* **Google Maps API Key**: With *Maps JavaScript API* enabled (pre-configured in `frontend/.env`).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/school-zone-sentinel.git
cd school-zone-sentinel
```

---

### Step 2: Backend Setup (FastAPI)

1. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install fastapi uvicorn pydantic
   ```

3. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

Verify backend health at: **[http://localhost:8000/api/health](http://localhost:8000/api/health)**

---

### Step 3: Frontend Setup (React + Vite)

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `frontend/.env` contains your Google Maps API Key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyCVzLKfolo_k0KxtBmn55WjTCJ27VIour8
   ```

4. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173
   ```

Open your browser at: **[http://localhost:5173/](http://localhost:5173/)**

---

### Step 4: One-Click Launcher (Windows)
Double-click `start_all.bat` or run from PowerShell:
```cmd
start_all.bat
```
This automatically launches both the FastAPI backend server on port 8000 and the Vite frontend on port 5173 in parallel.

---

## 🌐 REST API Reference

| Method | Endpoint | Description | Sample Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health, zone count & fleet size | `{"status": "HEALTHY", "total_zones": 53, "fleet_size": 5}` |
| `GET` | `/api/zones` | GeoJSON collection of 53 educational zones | FeatureCollection with coordinates & metadata |
| `GET` | `/api/fleet` | Registered commercial fleet units & routes | `{"fleet": [{"unit_id": "UNIT-01", "driver_name": "Marcus Johnson", ...}]}` |
| `GET` | `/api/audit-logs` | Session compliance logs (filters: `limit`, `severity`) | `{"total_stored": 28, "logs": [...]}` |
| `GET` | `/api/audit-logs/export` | Download audit logs as CSV file | `sentinel_compliance_audit.csv` attachment |
| `POST` | `/api/simulation/control` | Control simulation playback state | `{"status": "OK", "action": "play"}` |
| `POST` | `/api/dispatcher/warning` | Issue automated in-cab audio alert to vehicle | `{"status": "SUCCESS", "message": "In-cab warning delivered"}` |
| `POST` | `/api/dispatcher/supervisor` | Dispatch patrol supervisor unit | `{"status": "SUCCESS", "message": "Supervisor unit dispatched"}` |

### cURL Verification Examples

**Check System Health:**
```bash
curl -s http://127.0.0.1:8000/api/health
```

**Export Compliance Audit Log to CSV:**
```bash
curl -O http://127.0.0.1:8000/api/audit-logs/export
```

**Send In-Cab Warning via REST:**
```bash
curl -X POST http://127.0.0.1:8000/api/dispatcher/warning \
  -H "Content-Type: application/json" \
  -d '{
    "unit_id": "UNIT-01",
    "driver_name": "Marcus Johnson",
    "vehicle_id": "AMZN-BLR-01",
    "zone_id": "BLR-SCH-001",
    "zone_name": "Bishop Cotton Boys School",
    "speed_mph": 28.5,
    "speed_kmh": 45.8,
    "speed_limit_mph": 15.0
  }'
```

---

## 📡 WebSocket Protocol Specification

* **Endpoint**: `ws://localhost:8000/ws/telemetry`
* **Broadcast Frequency**: Continuous state stream @ 1 Hz with sub-frame 60 FPS client interpolation.

### Inbound Server Frame (`TELEMETRY_FRAME`)
```json
{
  "type": "TELEMETRY_FRAME",
  "step": 42,
  "total_steps": 143,
  "is_playing": true,
  "speed_multiplier": 1,
  "vehicles": [
    {
      "unit_id": "UNIT-01",
      "driver_id": "DRV-1092",
      "driver_name": "Marcus Johnson",
      "vehicle_id": "AMZN-BLR-01",
      "fleet": "Amazon Logistics",
      "vehicle_type": "Delivery Van",
      "license_plate": "KA-01-MJ-8820",
      "latitude": 12.9712,
      "longitude": 77.6015,
      "bearing": 182.4,
      "speed_mph": 28.5,
      "speed_kmh": 45.8,
      "in_zone": true,
      "zone_id": "BLR-SCH-001",
      "zone_name": "Bishop Cotton Boys' School",
      "speed_limit_mph": 15,
      "speed_limit_kmh": 25,
      "excess_mph": 13.5,
      "excess_kmh": 20.8,
      "status": "CRITICAL_VIOLATION",
      "risk_level": "CRITICAL"
    }
  ],
  "active_violation": {
    "unit_id": "UNIT-01",
    "driver_name": "Marcus Johnson",
    "current_speed_mph": 28.5,
    "zone_name": "Bishop Cotton Boys' School"
  },
  "timestamp": "2026-11-19T17:28:00.000Z"
}
```

### Outbound Client Actions
Clients can send JSON commands over the open WebSocket:
```json
{ "action": "play" }
{ "action": "pause" }
{ "action": "seek", "params": { "step": 85 } }
{ "action": "issue_warning", "params": { "unit_id": "UNIT-01", "zone_id": "BLR-SCH-001" } }
{ "action": "dispatch_supervisor", "params": { "unit_id": "UNIT-01", "zone_id": "BLR-SCH-001" } }
```

---

## 🚀 Live Cloud Deployment on Render

This repository is pre-configured for **1-click zero-config deployment on Render** (Free Tier supported).

### Architecture on Render
The application runs as a **unified high-performance web service**:
- **Multi-stage Docker build** builds the React + Vite frontend into `/frontend/dist`.
- **FastAPI backend** serves the high-throughput WebSocket (`/ws/telemetry`), REST API (`/api/*`), and static SPA client from a single URL on port `$PORT`.
- **No CORS problems & zero configuration:** Frontend automatically detects `window.location.host` and connects to `wss://` in production and `ws://` locally.

---

### Method A: Deploy via Render Blueprint (Recommended - 1 Click)

1. Push your repository to **GitHub** or **GitLab**:
   ```bash
   git remote add origin https://github.com/<your-username>/sentinel-safety-engine.git
   git push -u origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Select your GitHub repository. Render reads `render.yaml` automatically and configures:
   - **Service Type:** Web Service (Docker)
   - **Plan:** Free
   - **Health Check:** `/api/health`
5. Click **Apply**. Render will build and launch your live URL (e.g. `https://sentinel-safety-engine.onrender.com`).

---

### Method B: Manual Web Service Setup on Render

1. Log in to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name:** `sentinel-safety-engine`
   - **Region:** Any (e.g. Oregon, Frankfurt, Singapore)
   - **Language / Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free`
   - **Health Check Path:** `/api/health`
4. Click **Deploy Web Service**. Render builds the image, starts the container, and provisions a free SSL certificate.

---

### Alternative: Native Python Runtime on Render (Without Docker)

If you prefer Render's native Python runtime instead of Docker:
1. Choose **Python 3** as Runtime.
2. **Build Command:** `./build.sh` (or `pip install -r requirements.txt && cd frontend && npm install && npm run build && cd ..`)
3. **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables:**
   - `PYTHON_VERSION`: `3.11.0`
   - `NODE_VERSION`: `20.10.0`

---

## 🧪 Testing & Production Build

### Running Frontend Production Build
```bash
cd frontend
npm run build
```
* **Build Time**: ~700–900 ms via Vite.
* **Bundle Size**: Only **277 kB** total JS (85 kB gzip), optimized by 79% following removal of legacy dependencies.

### Running End-to-End WebSocket Verification
Run the automated asynchronous WebSocket tester from project root:
```bash
python -c "
import asyncio, websockets, json
async def test():
    async with websockets.connect('ws://localhost:8000/ws/telemetry') as ws:
        frame = json.loads(await ws.recv())
        print('Verified WebSocket Stream:')
        print(' - Total vehicles:', len(frame.get('vehicles', [])))
        print(' - Active violation:', frame.get('active_violation') is not None)
asyncio.run(test())
"
```

---

## 👥 Engineering Team & Subsystem Ownership

| Team Member | Engineering Role | Key Subsystems & Files Owned |
| :--- | :--- | :--- |
| **Rehan Ahmed**<br/>([@rehanahmed14](https://github.com/rehanahmed14)) | **Backend Engine, Spatial GIS & Telemetry Stream** | • `backend/services/geofence_engine.py` (Ray-Casting Point-in-Polygon & Haversine speed limits)<br/>• `backend/services/telemetry_streamer.py` (High-frequency GPS simulation broadcast)<br/>• `backend/data/bengaluru_schools.geojson` (53 School & college spatial boundaries)<br/>• `backend/main.py` (FastAPI REST API and bidirectional WebSocket server)<br/>• `frontend/src/components/map/UniversalSentinelMap.tsx` (CartoDB Dark Matter & Google fallback) |
| **Sanjana MK**<br/>([@MKSanjana14](https://github.com/MKSanjana14)) | **Frontend UI, Sentinel Control Tower & Cloud DevOps** | • `frontend/src/components/layout/ModernControlTowerLayout.tsx` (Obsidian glassmorphism layout)<br/>• `frontend/src/components/fleet/FleetRoster.tsx` & `DriverRideSheet.tsx` (Uber-style driver sheet)<br/>• `frontend/src/components/feed/ComplianceDrawer.tsx` (Audit log feed, severity filters, CSV export)<br/>• `frontend/src/utils/audio.ts` (Web Audio API synthesized dual-tone warning siren)<br/>• `Dockerfile`, `render.yaml`, `build.sh` (Multi-stage containerization & Render deployment) |

---

## 🛡️ License

This project is licensed under the **MIT License**. Free for commercial, institutional, and municipal traffic safety research and deployments.
