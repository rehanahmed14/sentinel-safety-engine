import React, { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Key, AlertCircle } from "lucide-react";
import type { VehicleTelemetry, CriticalViolationEvent } from "../../types/telemetry";
import type { SchoolZoneCollection } from "../../types/geofence";
import { GOOGLE_MAPS_DARK_STYLE } from "../../utils/googleMapsDarkStyle";
import { MapHUD } from "./MapHUD";

const DEFAULT_GOOGLE_MAPS_KEY = "AIzaSyCVzLKfolo_k0KxtBmn55WjTCJ27VIour8";

// 🚀 Pre-fetch data immediately at module evaluation so it's already in memory when map mounts
const cachedZonesPromise: Promise<SchoolZoneCollection | null> = fetch("/data/bengaluru_schools.geojson")
  .then((res) => (res.ok ? res.json() : null))
  .catch(() => null);

const cachedRoutesPromise: Promise<any | null> = fetch("/data/bengaluru_trajectories.json")
  .then((res) => (res.ok ? res.json() : null))
  .catch(() => null);

interface GoogleSentinelMapProps {
  vehicles: VehicleTelemetry[];
  selectedUnitId: string | null;
  activeViolation: CriticalViolationEvent | null;
  onSelectUnit: (unitId: string) => void;
  onFallbackToLeaflet?: () => void;
}

interface InterpolatedState {
  currentLat: number;
  currentLng: number;
  currentBearing: number;
  targetLat: number;
  targetLng: number;
  targetBearing: number;
}

const BENGALURU_CENTER = { lat: 12.9715, lng: 77.6035 };

export const GoogleSentinelMap: React.FC<GoogleSentinelMapProps> = ({
  vehicles,
  selectedUnitId,
  activeViolation,
  onSelectUnit,
  onFallbackToLeaflet
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const visualStatesRef = useRef<Map<string, InterpolatedState>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  const polygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());
  const zoneMetaRef = useRef<Map<string, { isCollege: boolean }>>(new Map());
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [apiKey, setApiKey] = useState<string>(() => {
    return (
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      localStorage.getItem("sentinel_google_maps_key") ||
      DEFAULT_GOOGLE_MAPS_KEY
    );
  });
  const [inputKey, setInputKey] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showZones, setShowZones] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);

  const lastFlownViolationRef = useRef<string | null>(null);

  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (trimmed) {
      localStorage.setItem("sentinel_google_maps_key", trimmed);
      setApiKey(trimmed);
      setLoadError(null);
    }
  };

  // ⚡ Google Maps Initialization with 3.5s Fallback Timeout:
  useEffect(() => {
    if (!apiKey || !mapContainerRef.current) return;

    let isMounted = true;

    // Safety timeout: if Google Maps hangs or fails for > 3.5s, fall back to Leaflet immediately
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !mapRef.current && onFallbackToLeaflet) {
        console.warn("Google Maps load timed out. Automatically falling back to CartoDB Dark Matter.");
        onFallbackToLeaflet();
      }
    }, 3500);

    async function initGoogle() {
      try {
        let MapClass: typeof google.maps.Map;
        let InfoWindowClass: typeof google.maps.InfoWindow;

        // If window.google.maps is already loaded, instantiate synchronously!
        if (typeof window !== "undefined" && window.google?.maps?.Map) {
          MapClass = window.google.maps.Map;
          InfoWindowClass = window.google.maps.InfoWindow;
        } else {
          setOptions({
            key: apiKey,
            v: "weekly"
          });
          const mapsLib = (await importLibrary("maps")) as google.maps.MapsLibrary;
          MapClass = mapsLib.Map;
          InfoWindowClass = mapsLib.InfoWindow;
        }

        if (!isMounted || !mapContainerRef.current) return;
        clearTimeout(fallbackTimer);

        const map = new MapClass(mapContainerRef.current, {
          center: BENGALURU_CENTER,
          zoom: 15.5,
          backgroundColor: "#09090b",
          styles: GOOGLE_MAPS_DARK_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
          maxZoom: 20,
          minZoom: 11
        });

        map.addListener("dragstart", () => {
          setIsFollowMode(false);
        });

        // Unlock follow mode on user zoom so camera doesn't fight tile loading
        map.addListener("zoom_changed", () => {
          setIsFollowMode(false);
        });

        // Trigger resize calculation to ensure tiles cover full viewport
        const resizeObserver = new ResizeObserver(() => {
          google.maps.event.trigger(map, "resize");
        });
        if (mapContainerRef.current) {
          resizeObserver.observe(mapContainerRef.current);
        }

        mapRef.current = map;
        const infoWindow = new InfoWindowClass();
        infoWindowRef.current = infoWindow;
        setIsLoaded(true);

        // Concurrently populate zones & routes from the pre-fetched promises
        const [geoJson, routesData] = await Promise.all([
          cachedZonesPromise,
          cachedRoutesPromise
        ]);

        if (!isMounted || !mapRef.current) return;

        // Populate polygons
        if (geoJson && geoJson.features) {
          geoJson.features.forEach((feature) => {
            const zoneId = feature.properties.zone_id;
            const coords = feature.geometry.coordinates[0].map(([lng, lat]) => ({
              lat,
              lng
            }));

            const isCollege =
              feature.properties.amenity === "college" ||
              feature.properties.amenity === "university" ||
              zoneId.startsWith("BLR-COL");

            zoneMetaRef.current.set(zoneId, { isCollege });
            const baseColor = isCollege ? "#06b6d4" : "#a855f7";

            const polygon = new google.maps.Polygon({
              paths: coords,
              strokeColor: baseColor,
              strokeOpacity: 0.9,
              strokeWeight: 2,
              fillColor: baseColor,
              fillOpacity: 0.14,
              map: showZones ? map : null
            });

            polygon.addListener("click", (e: google.maps.PolyMouseEvent) => {
              if (!infoWindowRef.current || !e.latLng) return;
              const categoryBadge = isCollege ? "COLLEGE / UNIVERSITY" : "K-12 SCHOOL ZONE";
              const categoryColor = isCollege ? "#22d3ee" : "#c084fc";
              const content = `
                <div style="padding: 10px; font-family: monospace; font-size: 12px; background: #09090b; color: #f3f4f6; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); min-width: 200px;">
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
              infoWindowRef.current.setContent(content);
              infoWindowRef.current.setPosition(e.latLng);
              infoWindowRef.current.open(map);
            });

            polygonsRef.current.set(zoneId, polygon);
          });
        }

        // Populate route lines
        if (routesData && routesData.vehicles) {
          routesData.vehicles.forEach((v: any) => {
            const path = v.waypoints.map((wp: any) => ({
              lat: wp.latitude,
              lng: wp.longitude
            }));

            const polyline = new google.maps.Polyline({
              path,
              geodesic: true,
              strokeColor: "#00f0ff",
              strokeOpacity: 0.45,
              strokeWeight: 2.5,
              map: showRoutes ? map : null
            });

            polylinesRef.current.push(polyline);
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load Google Maps API.";
          setLoadError(msg);
        }
      }
    }

    initGoogle();

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [apiKey, onFallbackToLeaflet]);

  // Update Polygon Colors on Violation
  useEffect(() => {
    polygonsRef.current.forEach((polygon, zoneId) => {
      const isViolated = activeViolation && activeViolation.zone_id === zoneId;
      if (isViolated) {
        polygon.setOptions({
          strokeColor: "#ff3366",
          strokeWeight: 3.5,
          fillColor: "#ff3366",
          fillOpacity: 0.4
        });
      } else {
        const meta = zoneMetaRef.current.get(zoneId);
        const baseColor = meta?.isCollege ? "#06b6d4" : "#a855f7";
        polygon.setOptions({
          strokeColor: baseColor,
          strokeWeight: 2,
          fillColor: baseColor,
          fillOpacity: 0.14
        });
      }
    });
  }, [activeViolation]);

  // Visibility Toggles
  useEffect(() => {
    const map = mapRef.current;
    polygonsRef.current.forEach((polygon) => {
      polygon.setMap(showZones ? map : null);
    });
    polylinesRef.current.forEach((line) => {
      line.setMap(showRoutes ? map : null);
    });
  }, [showZones, showRoutes]);

  // Update target coordinates
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    vehicles.forEach((v) => {
      let state = visualStatesRef.current.get(v.unit_id);
      let marker = markersRef.current.get(v.unit_id);

      if (!state) {
        state = {
          currentLat: v.latitude,
          currentLng: v.longitude,
          currentBearing: v.bearing,
          targetLat: v.latitude,
          targetLng: v.longitude,
          targetBearing: v.bearing
        };
        visualStatesRef.current.set(v.unit_id, state);
      } else {
        state.targetLat = v.latitude;
        state.targetLng = v.longitude;
        state.targetBearing = v.bearing;
      }

      const isSelected = selectedUnitId === v.unit_id;
      const isViolation = v.status === "CRITICAL_VIOLATION";

      const color = isViolation ? "#ff3366" : isSelected ? "#00f0ff" : "#38bdf8";
      const scale = isViolation ? 8.5 : isSelected ? 7.5 : 6.5;

      const icon: google.maps.Symbol = {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale,
        rotation: state.currentBearing,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 1.5
      };

      if (!marker) {
        marker = new google.maps.Marker({
          position: { lat: v.latitude, lng: v.longitude },
          map,
          icon,
          title: `${v.unit_id}: ${v.driver_name} (${v.speed_mph.toFixed(0)} mph)`
        });

        marker.addListener("click", () => {
          onSelectUnit(v.unit_id);
          setIsFollowMode(true);
        });

        markersRef.current.set(v.unit_id, marker);
      } else {
        marker.setIcon(icon);
      }
    });
  }, [vehicles, selectedUnitId, isLoaded, onSelectUnit]);

  // 60 FPS Continuous Marker Lerp & Follow Camera Loop on Google Maps
  useEffect(() => {
    let active = true;

    function renderLoop() {
      if (!active) return;

      visualStatesRef.current.forEach((state, unitId) => {
        const marker = markersRef.current.get(unitId);
        if (!marker) return;

        // Smooth delta interpolation
        const lerpFactor = 0.12;
        state.currentLat += (state.targetLat - state.currentLat) * lerpFactor;
        state.currentLng += (state.targetLng - state.currentLng) * lerpFactor;

        // Angular rotation lerp
        const dAngle = ((state.targetBearing - state.currentBearing + 540) % 360) - 180;
        state.currentBearing = (state.currentBearing + dAngle * lerpFactor + 360) % 360;

        marker.setPosition({ lat: state.currentLat, lng: state.currentLng });

        const currentIcon = marker.getIcon() as google.maps.Symbol | null;
        if (currentIcon && typeof currentIcon.rotation === "number") {
          if (Math.abs(currentIcon.rotation - state.currentBearing) > 0.8) {
            marker.setIcon({
              ...currentIcon,
              rotation: Math.round(state.currentBearing)
            });
          }
        }
      });

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    }

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      active = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  // Dedicated throttled follow camera: updates smoothly on telemetry tick without interrupting user zoom
  const lastPanTimeRef = useRef<number>(0);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isFollowMode || !selectedUnitId) return;

    const selected = vehicles.find((v) => v.unit_id === selectedUnitId);
    if (!selected) return;

    const now = Date.now();
    if (now - lastPanTimeRef.current > 1000) {
      lastPanTimeRef.current = now;
      map.panTo({ lat: selected.latitude, lng: selected.longitude });
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

      map.panTo({
        lat: activeViolation.latitude,
        lng: activeViolation.longitude
      });
      map.setZoom(17);
    }
  }, [activeViolation, onSelectUnit]);

  // Recenter
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return;
    setIsFollowMode(false);
    mapRef.current.panTo(BENGALURU_CENTER);
    mapRef.current.setZoom(15);
  }, []);

  // If no API key is set or load error, render setup dialog with clean fallback
  if (!apiKey || loadError) {
    return (
      <div className="w-full h-full bg-obsidian-950 flex items-center justify-center p-6 relative">
        <div className="glass-panel-elevated p-6 rounded-2xl max-w-md w-full border border-sentinel-cyan/30 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-xl bg-sentinel-cyan/10 border border-sentinel-cyan/40 mx-auto mb-3 flex items-center justify-center">
            <Key className="w-6 h-6 text-sentinel-cyan" />
          </div>

          <h3 className="text-base font-mono font-bold text-white mb-1.5 uppercase">
            Google Maps API Key
          </h3>
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Enter your Google Maps JavaScript API key for live tracking with Google Maps.
          </p>

          {loadError && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-sentinel-red/40 text-left text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-sentinel-red shrink-0 mt-0.5" />
              <span>{loadError}</span>
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste AIzaSy... API key"
              className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan"
            />

            <button
              onClick={handleSaveKey}
              disabled={!inputKey.trim()}
              className="w-full py-2 px-4 rounded-lg bg-sentinel-cyan hover:bg-sentinel-cyan/90 disabled:opacity-40 text-obsidian-950 font-mono text-xs font-bold transition-all shadow-glow-cyan"
            >
              ACTIVATE GOOGLE MAPS
            </button>

            {onFallbackToLeaflet && (
              <button
                onClick={onFallbackToLeaflet}
                className="w-full py-2 px-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all"
              >
                USE CARTO DARK MATTER (INSTANT / NO KEY)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-obsidian-950 overflow-hidden">
      {/* 🚀 Seamless ambient placeholder until first paint */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-obsidian-950 flex flex-col items-center justify-center z-10 select-none">
          <div className="w-10 h-10 rounded-2xl bg-sentinel-cyan/10 border border-sentinel-cyan/30 flex items-center justify-center shadow-glow-cyan animate-pulse mb-3">
            <span className="w-3 h-3 rounded-full bg-sentinel-cyan animate-ping" />
          </div>
          <div className="text-xs font-mono font-bold tracking-wider text-white uppercase">
            Loading Google Maps Fleet
          </div>
          <div className="text-[11px] font-mono text-gray-400 mt-1">
            Syncing 53 Bengaluru Institutional Corridors...
          </div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-full bg-[#09090b]"
        style={{ width: "100%", height: "100%", backgroundColor: "#09090b" }}
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
