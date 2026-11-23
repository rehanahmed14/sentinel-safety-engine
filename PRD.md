## Product Requirements Document (PRD): School Zone Sentinel

### 1. Overview & Problem Statement

Commercial delivery drivers under tight schedules frequently speed through residential neighborhoods and school zones. Fleet managers currently rely on reactive, post-trip reports, making it impossible to intercept dangerous driving in real-time. The **Geo-Fence Safety & Compliance Engine** is a live telemetry dashboard that cross-references real-time vehicle GPS traces with geo-fenced high-risk zones, instantly flagging active violations.

### 2. MVP Scope & Core Features

* **Live Telemetry Ingestion Pipeline:** A WebSockets or polling-based engine streaming simulated vehicle GPS coordinates and speed logs to the frontend.
* **Dynamic Geo-Fencing Engine:** The ability to render spatial polygons (school zones) on the map and calculate real-time point-in-polygon intersections.
* **Threshold Trigger System:** Boolean logic evaluating `if (vehicle_inside_zone && vehicle_speed > zone_speed_limit)`.
* **Instant Violation Alerts:** Real-time UI state changes (flashing zones, pop-up violation cards) triggered by the threshold engine.
* **Compliance Audit Log:** A historical feed of all flagged events during the session.

### 3. Data & API Architecture

| Component | Provider / Dataset | Role in Architecture |
| --- | --- | --- |
| **Base Map Rendering** | Mapbox GL JS (`react-map-gl`) | Renders the dark-mode vector tile map and handles the WebGL camera framing. |
| **Zone Polygons** | OpenStreetMap (OSM) via Overpass API | Provides the exact latitude/longitude bounding boxes for school zones in a target city. |
| **Vehicle Telemetry** | Kaggle GeoLife or Taxi Trajectory CSV | Serves as the mock live data feed. A script iterates through the CSV, broadcasting coordinates via JSON. |
| **Spatial Math** | Turf.js | Client-side or edge-function spatial analysis to calculate `turf.booleanPointInPolygon()` instantly. |

### 4. Tech Stack Recommendation

* **Frontend:** React (Vite) with TypeScript.
* **Styling:** Tailwind CSS + Shadcn/UI for rapid, accessible component assembly.
* **Animations:** GSAP (for violation pop-ups and timeline sequencing) and Framer Motion (for UI component mounting).
* **Backend / State:** Python (FastAPI) to stream the CSV rows via WebSockets, or a pure frontend implementation using a local JSON array combined with `setInterval`.

---

## Design System & UI/UX Guidelines

The visual language emphasizes a high-end, Silicon Valley "Control Tower" aesthetic. The goal is to draw the user's eye instantly to anomalies while keeping the background data muted.

* **Color Palette:**
* **Background:** Deep Obsidian (`#09090b` or Mapbox Dark v11).
* **Panel Surfaces:** Glassmorphic translucent dark gray (`rgba(255, 255, 255, 0.05)`) with a 1px `border-white/10` and intense background blur (`backdrop-blur-xl`).
* **Safe Route Line:** Neon Cyan (`#00f0ff`).
* **School Zone (Inactive):** Muted Purple stroke with 10% opacity fill.
* **School Zone (Violated):** Pulsing Neon Orange/Red (`#ff3366`) with a heavy drop shadow.


* **Typography:** Inter or Geist Sans. Monospace (JetBrains Mono) for speed metrics, coordinate readouts, and timestamps.
* **Motion (GSAP):**
* Vehicles move smoothly along the route using Mapbox's `requestAnimationFrame`.
* When a violation occurs, the UI does not just change color—the violation card "snaps" into the viewport with an elastic GSAP spring animation.



---

## Wireframe & Component Layout

### Screen 1: The Control Tower (Default State)

**Layout Structure: 3-Column Grid**

* **Left Sidebar (20% width): Active Fleet Roster**
* **Header:** "Sentinel Control Tower" with a pulsing green connection status dot.
* **Search/Filter:** Input field to search by Driver ID.
* **List Items:** Glassmorphic cards displaying Driver Name, Vehicle ID, and Current Speed.


* **Center Canvas (60% width): The Mapbox Viewport**
* The map is locked in a dark mode style.
* School zones are rendered as subtle, semi-transparent polygons.
* Vehicles are rendered as SVG arrows, rotating based on their bearing.


* **Right Sidebar (20% width): Compliance Feed**
* A live, scrolling terminal-style feed of system checks (e.g., `[14:02:01] Unit 04 passed Zone A - OK`).



### Screen 2: Violation Trigger (Event State)

When the threshold logic evaluates to `TRUE` (Speed > 15mph inside Polygon), the UI aggressively shifts focus:

**Layout Changes:**

* **Map Action:** The Mapbox camera automatically pans and zooms (`flyTo`) to center on the violating vehicle.
* **Polygon State:** The school zone polygon turns bright red and begins a CSS/GSAP pulse animation.
* **Center Canvas Overlay:** A prominent, blurred Glassmorphic modal drops down from the top center of the screen.
* **Modal Header:** ⚠️ CRITICAL SPEED VIOLATION
* **Data Grid:**
* Driver: Marcus Johnson
* Zone: Oak Creek Elementary (Limit: 15 MPH)
* Current Speed: 32 MPH


* **Action Buttons:** `[Issue Automated Warning]` (Primary) | `[Dispatch Supervisor]` (Secondary)


* **Right Sidebar Update:** The Compliance Feed flashes red, injecting a high-priority log entry that remains pinned to the top.