import React, { useState } from "react";
import { LeafletSentinelMap } from "./LeafletSentinelMap";
import { GoogleSentinelMap } from "./GoogleSentinelMap";
import type { VehicleTelemetry, CriticalViolationEvent } from "../../types/telemetry";
import { Layers } from "lucide-react";

interface UniversalSentinelMapProps {
  vehicles: VehicleTelemetry[];
  selectedUnitId: string | null;
  activeViolation: CriticalViolationEvent | null;
  onSelectUnit: (unitId: string) => void;
}

export const UniversalSentinelMap: React.FC<UniversalSentinelMapProps> = (props) => {
  // Default to Leaflet (Carto Dark Matter) for instant 100% reliable zero-key loading
  const [engine, setEngine] = useState<"leaflet" | "google">(() => {
    const saved = localStorage.getItem("sentinel_map_engine");
    return (saved as "leaflet" | "google") || "leaflet";
  });

  const toggleEngine = () => {
    const next = engine === "leaflet" ? "google" : "leaflet";
    localStorage.setItem("sentinel_map_engine", next);
    setEngine(next);
  };

  return (
    <div className="relative w-full h-full">
      {engine === "leaflet" ? (
        <LeafletSentinelMap
          {...props}
          onSwitchToGoogle={() => {
            localStorage.setItem("sentinel_map_engine", "google");
            setEngine("google");
          }}
        />
      ) : (
        <GoogleSentinelMap
          {...props}
          onFallbackToLeaflet={() => {
            localStorage.setItem("sentinel_map_engine", "leaflet");
            setEngine("leaflet");
          }}
        />
      )}

      {/* Floating Engine Switcher Capsule */}
      <div className="absolute top-16 right-3.5 z-20 pointer-events-auto select-none">
        <button
          onClick={toggleEngine}
          className="frosted-glass px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center gap-2 text-gray-200 hover:text-white hover:border-sentinel-cyan/50 transition-all shadow-xl group"
          title="Toggle between Carto Dark Matter and Google Maps"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping"></span>
          <Layers className="w-3.5 h-3.5 text-sentinel-cyan" />
          <span>MAP: {engine === "leaflet" ? "CARTO DARK (LIVE)" : "GOOGLE MAPS"}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sentinel-cyan/20 text-sentinel-cyan border border-sentinel-cyan/40">
            SWITCH
          </span>
        </button>
      </div>
    </div>
  );
};
