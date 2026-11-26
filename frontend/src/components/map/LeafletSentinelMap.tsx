import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VehicleTelemetry, CriticalViolationEvent } from "../../types/telemetry";
import type { SchoolZoneCollection } from "../../types/geofence";
import { MapHUD } from "./MapHUD";

const BENGALURU_CENTER: [number, number] = [12.9715, 77.6035];

interface LeafletSentinelMapProps {
  vehicles: VehicleTelemetry[];
  selectedUnitId: string | null;
  activeViolation: CriticalViolationEvent | null;
  onSelectUnit: (unitId: string) => void;
  onSwitchToGoogle?: () => void;
}

interface InterpolatedState {
  currentLat: number;
  currentLng: number;
  currentBearing: number;
  targetLat: number;
  targetLng: number;
  targetBearing: number;
}

export const LeafletSentinelMap: React.FC<LeafletSentinelMapProps> = ({
  vehicles,
  selectedUnitId,
  activeViolation,
  onSelectUnit
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polygonsRef = useRef<Map<string, L.Polygon>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);
  const visualStatesRef = useRef<Map<string, InterpolatedState>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);
  const lastFlownViolationRef = useRef<string | null>(null);
  const zoneMetaRef = useRef<Map<string, { isCollege: boolean }>>(new Map());

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: BENGALURU_CENTER,
      zoom: 15.5,
      zoomControl: true,
      attributionControl: false
    });

    // Dark Matter tile layer from CartoDB (Fast, Free, No API Key Required)
    const tileLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 19,
        className: "carto-dark-tiles"
      }
    );
    tileLayer.addTo(map);

    map.on("dragstart", () => {
      setIsFollowMode(false);
    });
    map.on("zoomstart", () => {
      setIsFollowMode(false);
    });

    mapRef.current = map;
    setIsLoaded(true);

    // Concurrently load 53 School Zones and Trajectory Routes
    Promise.all([
      fetch("/data/bengaluru_schools.geojson").then((r) => (r.ok ? r.json() : null)),
      fetch("/data/bengaluru_trajectories.json").then((r) => (r.ok ? r.json() : null))
    ])
      .then(([geoJson, routesData]: [SchoolZoneCollection | null, any | null]) => {
        if (!isMounted || !mapRef.current) return;

        // Render 53 Institutional Polygons
        if (geoJson && geoJson.features) {
          geoJson.features.forEach((feature) => {
            const zoneId = feature.properties.zone_id;
            const coords: [number, number][] = feature.geometry.coordinates[0].map(
              ([lng, lat]) => [lat, lng]
            );

            const isCollege =
              feature.properties.amenity === "college" ||
              feature.properties.amenity === "university" ||
              zoneId.startsWith("BLR-COL");

            zoneMetaRef.current.set(zoneId, { isCollege });
            const baseColor = isCollege ? "#06b6d4" : "#a855f7";

            const polygon = L.polygon(coords, {
              color: baseColor,
              weight: 2,
              opacity: 0.9,
              fillColor: baseColor,
              fillOpacity: 0.16
            });

            const categoryBadge = isCollege ? "COLLEGE / UNIVERSITY" : "K-12 SCHOOL ZONE";
            const categoryColor = isCollege ? "#22d3ee" : "#c084fc";
            const popupContent = `
              <div style="padding: 10px; font-family: monospace; font-size: 12px; background: #09090b; color: #f3f4f6; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); min-width: 210px;">
                <div style="display: inline-block; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: ${categoryColor}; margin-bottom: 6px;">
                  ${categoryBadge}
                </div>
                <div style="font-weight: bold; color: #ffffff; font-size: 13px; margin-bottom: 4px;">${feature.properties.name}</div>
                <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px;">${feature.properties.address}</div>
                <div style="background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #94a3b8;">SAFETY LIMIT:</span>
                  <b style="color: #00f0ff;">${feature.properties.speed_limit_mph} MPH (${feature.properties.speed_limit_kmh} KM/H)</b>
                </div>
              </div>
            `;
            polygon.bindPopup(popupContent, {
              className: "sentinel-dark-popup"
            });

            if (showZones) {
              polygon.addTo(map);
            }
            polygonsRef.current.set(zoneId, polygon);
          });
        }

        // Render Routes
        if (routesData && routesData.vehicles) {
          routesData.vehicles.forEach((v: any) => {
            const path: [number, number][] = v.waypoints.map((wp: any) => [
              wp.latitude,
              wp.longitude
            ]);

            const polyline = L.polyline(path, {
              color: "#00f0ff",
              weight: 2.5,
              opacity: 0.45
            });

            if (showRoutes) {
              polyline.addTo(map);
            }
            polylinesRef.current.push(polyline);
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load map data:", err);
      });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Zone visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    polygonsRef.current.forEach((polygon) => {
      if (showZones) {
        if (!map.hasLayer(polygon)) map.addLayer(polygon);
      } else {
        if (map.hasLayer(polygon)) map.removeLayer(polygon);
      }
    });
  }, [showZones]);

  // Update Route visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    polylinesRef.current.forEach((polyline) => {
      if (showRoutes) {
        if (!map.hasLayer(polyline)) map.addLayer(polyline);
      } else {
        if (map.hasLayer(polyline)) map.removeLayer(polyline);
      }
    });
  }, [showRoutes]);

  // Violation Polygon Highlight
  useEffect(() => {
    polygonsRef.current.forEach((polygon, zoneId) => {
      const isViolated = activeViolation && activeViolation.zone_id === zoneId;
      if (isViolated) {
        polygon.setStyle({
          color: "#ff3366",
          fillColor: "#ff3366",
          fillOpacity: 0.4,
          weight: 3.5
        });
      } else {
        const meta = zoneMetaRef.current.get(zoneId);
        const baseColor = meta?.isCollege ? "#06b6d4" : "#a855f7";
        polygon.setStyle({
          color: baseColor,
          fillColor: baseColor,
          fillOpacity: 0.16,
          weight: 2
        });
      }
    });
  }, [activeViolation]);

  // Create & Update Vehicle Markers with Custom HTML Icons
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    vehicles.forEach((v) => {
      let state = visualStatesRef.current.get(v.unit_id);
      if (!state) {
        state = {
          currentLat: v.latitude,
          currentLng: v.longitude,
          currentBearing: v.bearing || 0,
          targetLat: v.latitude,
          targetLng: v.longitude,
          targetBearing: v.bearing || 0
        };
        visualStatesRef.current.set(v.unit_id, state);
      } else {
        state.targetLat = v.latitude;
        state.targetLng = v.longitude;
        state.targetBearing = v.bearing || 0;
      }

      const isSelected = selectedUnitId === v.unit_id;
      const isViolating = v.status === "CRITICAL_VIOLATION";
      const isApproaching = v.status === "APPROACHING_ZONE";

      const iconColor = isViolating ? "#ff3366" : isApproaching ? "#f59e0b" : "#00f0ff";
      const haloClass = isViolating
        ? "puck-halo-violation"
        : isSelected
        ? "puck-halo-safe"
        : "";

      const iconHtml = `
        <div class="relative flex items-center justify-center" style="width: 38px; height: 38px; cursor: pointer;">
          ${haloClass ? `<div class="absolute inset-0 rounded-full ${haloClass}"></div>` : ""}
          <div class="relative w-8 h-8 rounded-full bg-obsidian-950/90 border-2 flex items-center justify-center shadow-lg" style="border-color: ${iconColor}; transform: rotate(${Math.round(state.currentBearing)}deg);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${iconColor}" stroke="none">
              <path d="M12 2L4 20L12 16L20 20L12 2Z"/>
            </svg>
          </div>
          <div class="absolute -bottom-2 bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono font-bold text-white whitespace-nowrap border border-white/10" style="border-color: ${iconColor}40;">
            ${v.unit_id.replace("UNIT-0", "U")}
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        html: iconHtml,
        className: "sentinel-vehicle-marker",
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      let marker = markersRef.current.get(v.unit_id);
      if (!marker) {
        marker = L.marker([state.currentLat, state.currentLng], { icon: divIcon });
        marker.on("click", () => {
          onSelectUnit(v.unit_id);
          setIsFollowMode(true);
        });
        marker.addTo(map);
        markersRef.current.set(v.unit_id, marker);
      } else {
        marker.setIcon(divIcon);
      }
    });
  }, [vehicles, selectedUnitId, onSelectUnit]);

  // 60 FPS Marker Position & Rotation Lerp Loop
  useEffect(() => {
    let active = true;

    function renderLoop() {
      if (!active) return;

      visualStatesRef.current.forEach((state, unitId) => {
        const marker = markersRef.current.get(unitId);
        if (!marker) return;

        const lerpFactor = 0.12;
        state.currentLat += (state.targetLat - state.currentLat) * lerpFactor;
        state.currentLng += (state.targetLng - state.currentLng) * lerpFactor;

        const dAngle = ((state.targetBearing - state.currentBearing + 540) % 360) - 180;
        state.currentBearing = (state.currentBearing + dAngle * lerpFactor + 360) % 360;

        marker.setLatLng([state.currentLat, state.currentLng]);
      });

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      active = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Follow Camera Effect
  const lastPanTimeRef = useRef<number>(0);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isFollowMode || !selectedUnitId) return;

    const selected = vehicles.find((v) => v.unit_id === selectedUnitId);
    if (!selected) return;

    const now = Date.now();
    if (now - lastPanTimeRef.current > 1000) {
      lastPanTimeRef.current = now;
      map.panTo([selected.latitude, selected.longitude], {
        animate: true,
        duration: 0.8
      });
    }
  }, [vehicles, selectedUnitId, isFollowMode]);

  // Auto-pan on Critical Violation
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeViolation) return;

    const violationKey = `${activeViolation.unit_id}-${activeViolation.zone_id}`;
    if (lastFlownViolationRef.current !== violationKey) {
      lastFlownViolationRef.current = violationKey;
      onSelectUnit(activeViolation.unit_id);
      setIsFollowMode(true);
      map.flyTo([activeViolation.latitude, activeViolation.longitude], 17, {
        duration: 1.2
      });
    }
  }, [activeViolation, onSelectUnit]);

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(BENGALURU_CENTER, 15.5, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full h-full bg-obsidian-950 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-obsidian-950 flex flex-col items-center justify-center z-10 select-none">
          <div className="w-10 h-10 rounded-2xl bg-sentinel-cyan/10 border border-sentinel-cyan/30 flex items-center justify-center shadow-glow-cyan animate-pulse mb-3">
            <span className="w-3 h-3 rounded-full bg-sentinel-cyan animate-ping" />
          </div>
          <div className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            Initializing Sentinel Dark Map
          </div>
          <div className="text-[11px] font-mono text-gray-400 mt-1">
            Loading CartoDB Dark Matter & 53 Corridors...
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full bg-[#09090b]"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Floating Map HUD */}
      <MapHUD
        showZones={showZones}
        showRoutes={showRoutes}
        onToggleZones={() => setShowZones(!showZones)}
        onToggleRoutes={() => setShowRoutes(!showRoutes)}
        onRecenter={handleRecenter}
        activeVehiclesCount={vehicles.length}
      />
    </div>
  );
};
