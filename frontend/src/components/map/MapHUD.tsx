import React from "react";
import { Layers, Eye, EyeOff, Crosshair } from "lucide-react";

interface MapHUDProps {
  showZones: boolean;
  showRoutes: boolean;
  onToggleZones: () => void;
  onToggleRoutes: () => void;
  onRecenter: () => void;
  activeVehiclesCount?: number;
}

export const MapHUD: React.FC<MapHUDProps> = ({
  showZones,
  showRoutes,
  onToggleZones,
  onToggleRoutes,
  onRecenter
}) => {
  return (
    <div className="absolute bottom-5 right-5 z-20 flex flex-col gap-2 select-none pointer-events-auto">
      {/* Floating Controls (Frosted Glass) */}
      <div className="frosted-glass p-2 rounded-2xl flex items-center gap-1.5 shadow-2xl">
        <button
          onClick={onToggleZones}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            showZones
              ? "bg-purple-500/25 text-purple-200 border border-purple-500/40"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
          title="Toggle School Zones"
        >
          {showZones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>ZONES</span>
        </button>

        <button
          onClick={onToggleRoutes}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            showRoutes
              ? "bg-sentinel-cyan/25 text-sentinel-cyan border border-sentinel-cyan/40"
              : "bg-white/5 text-gray-400 hover:text-white"
          }`}
          title="Toggle Safe Routes"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ROUTES</span>
        </button>

        <button
          onClick={onRecenter}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="Recenter Camera to Fleet"
          aria-label="Recenter Map"
        >
          <Crosshair className="w-3.5 h-3.5 text-sentinel-cyan" />
        </button>
      </div>
    </div>
  );
};
