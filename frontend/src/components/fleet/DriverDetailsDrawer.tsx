import React from "react";
import { X, Navigation, MapPin, Gauge, Shield, Truck, Compass } from "lucide-react";
import type { VehicleTelemetry } from "../../types/telemetry";
import { SpeedBadge } from "../common/SpeedBadge";
import { StatusChip } from "../common/StatusChip";

interface DriverDetailsDrawerProps {
  vehicle: VehicleTelemetry | null;
  onClose: () => void;
}

export const DriverDetailsDrawer: React.FC<DriverDetailsDrawerProps> = ({
  vehicle,
  onClose
}) => {
  if (!vehicle) return null;

  const isViolation = vehicle.status === "CRITICAL_VIOLATION";

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 glass-panel-elevated rounded-xl p-4 border border-white/10 shadow-2xl select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <Truck className={`w-4 h-4 ${isViolation ? "text-sentinel-red" : "text-sentinel-cyan"}`} />
          <div>
            <h3 className="text-xs font-mono font-bold text-white">
              {vehicle.unit_id} • {vehicle.driver_name}
            </h3>
            <span className="text-[10px] font-mono text-gray-400">
              {vehicle.vehicle_id} ({vehicle.driver_id})
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          aria-label="Close vehicle details"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Real-time Telemetry Grid */}
      <div className="space-y-2.5 text-xs font-mono">
        {/* Speed & Status */}
        <div className="flex items-center justify-between bg-obsidian-950/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
            <Gauge className="w-3.5 h-3.5 text-sentinel-cyan" />
            <span>SPEED</span>
          </div>
          <SpeedBadge
            speedMph={vehicle.speed_mph}
            speedKmh={vehicle.speed_kmh}
            limitMph={vehicle.geofence.speed_limit_mph}
            isViolation={isViolation}
            size="sm"
          />
        </div>

        {/* GPS Coordinates */}
        <div className="flex items-center justify-between bg-obsidian-950/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>GPS COORDS</span>
          </div>
          <span className="text-gray-200 text-[11px]">
            {vehicle.latitude.toFixed(5)}°, {vehicle.longitude.toFixed(5)}°
          </span>
        </div>

        {/* Heading & Bearing */}
        <div className="flex items-center justify-between bg-obsidian-950/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
            <Compass className="w-3.5 h-3.5 text-gray-400" />
            <span>BEARING</span>
          </div>
          <div className="flex items-center gap-1 text-gray-200">
            <Navigation
              className="w-3 h-3 text-sentinel-cyan"
              style={{ transform: `rotate(${vehicle.bearing}deg)` }}
            />
            <span>{Math.round(vehicle.bearing)}° AZIMUTH</span>
          </div>
        </div>

        {/* Active Geofence State */}
        <div className="bg-obsidian-950/70 p-2 rounded-lg border border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-sentinel-purple" />
              <span>SPATIAL STATUS</span>
            </div>
            <StatusChip status={vehicle.status} />
          </div>
          {vehicle.geofence.in_zone ? (
            <div className="text-[11px] text-sentinel-purple font-sans font-medium">
              Inside: {vehicle.geofence.zone_name} (Limit {vehicle.geofence.speed_limit_mph} MPH)
            </div>
          ) : (
            <div className="text-[11px] text-gray-400 font-sans">
              Nearest Zone: {vehicle.geofence.nearest_zone_dist_m > 0 ? `${vehicle.geofence.nearest_zone_dist_m}m away` : 'Clear'}
            </div>
          )}
        </div>

        {/* Assigned Route */}
        <div className="text-[10px] text-gray-400 font-sans pt-1 truncate">
          Route: {vehicle.assigned_route}
        </div>
      </div>
    </div>
  );
};
