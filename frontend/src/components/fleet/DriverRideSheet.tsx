import React from "react";
import { Truck, Navigation, Gauge, Shield, X, Lock, Unlock, Compass } from "lucide-react";
import type { VehicleTelemetry } from "../../types/telemetry";
import { StatusChip } from "../common/StatusChip";

interface DriverRideSheetProps {
  vehicle: VehicleTelemetry | null;
  isFollowMode: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}

export const DriverRideSheet: React.FC<DriverRideSheetProps> = ({
  vehicle,
  isFollowMode,
  onToggleFollow,
  onClose
}) => {
  if (!vehicle) return null;

  const isViolation = vehicle.status === "CRITICAL_VIOLATION";

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4 pointer-events-auto select-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`frosted-glass-elevated p-4 rounded-3xl transition-all ${
          isViolation ? "border-sentinel-red/80 ring-2 ring-sentinel-red/40" : ""
        }`}
      >
        {/* Top Header Row: Driver Avatar & Quick Info */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-3">
            {/* Driver Avatar Circle (Uber style) */}
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm font-mono shadow-md border ${
                isViolation
                  ? "bg-sentinel-red text-white border-white/40 shadow-glow-red animate-pulse"
                  : "bg-black/50 text-sentinel-cyan border-sentinel-cyan/40"
              }`}
            >
              {vehicle.driver_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {vehicle.driver_name}
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-200 border border-white/10">
                  {vehicle.unit_id}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {vehicle.fleet} • {vehicle.vehicle_type}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Follow / Free Camera Button */}
            <button
              onClick={onToggleFollow}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-mono font-bold transition-all ${
                isFollowMode
                  ? "bg-sentinel-cyan text-obsidian-950 shadow-glow-cyan"
                  : "bg-white/10 text-gray-300 hover:text-white"
              }`}
              title={isFollowMode ? "Camera Locked on Driver" : "Free Camera"}
            >
              {isFollowMode ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isFollowMode ? "TRACKING" : "FREE CAM"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close Driver Details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Grid: Live Speed Readout & Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs">
          {/* Speed Card */}
          <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 mb-0.5 uppercase flex items-center gap-1">
              <Gauge className="w-3 h-3 text-sentinel-cyan" />
              SPEED
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold font-mono ${isViolation ? "text-sentinel-red" : "text-white"}`}>
                {vehicle.speed_mph.toFixed(0)}
              </span>
              <span className="text-[10px] uppercase font-sans text-gray-400">mph</span>
              <span className="text-[10px] text-gray-500 ml-1">({vehicle.speed_kmh.toFixed(0)}k)</span>
            </div>
          </div>

          {/* Registration Plate */}
          <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 mb-0.5 uppercase flex items-center gap-1">
              <Truck className="w-3 h-3 text-gray-400" />
              VEHICLE ID
            </span>
            <span className="text-xs font-bold text-gray-200 truncate">
              {vehicle.vehicle_id}
            </span>
          </div>

          {/* Heading */}
          <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center">
            <span className="text-[10px] text-gray-400 mb-0.5 uppercase flex items-center gap-1">
              <Compass className="w-3 h-3 text-gray-400" />
              BEARING
            </span>
            <div className="flex items-center gap-1 text-gray-200 text-xs">
              <Navigation
                className="w-3 h-3 text-sentinel-cyan"
                style={{ transform: `rotate(${vehicle.bearing}deg)` }}
              />
              <span>{Math.round(vehicle.bearing)}° AZIMUTH</span>
            </div>
          </div>

          {/* Status */}
          <div className="bg-black/40 p-2.5 rounded-2xl border border-white/5 flex flex-col justify-center items-start">
            <span className="text-[10px] text-gray-400 mb-1 uppercase">STATUS</span>
            <StatusChip status={vehicle.status} />
          </div>
        </div>

        {/* School Zone Context Banner */}
        <div
          className={`px-3 py-2 rounded-2xl text-xs flex items-center justify-between font-mono ${
            vehicle.geofence.in_zone
              ? isViolation
                ? "bg-sentinel-red/25 text-white border border-sentinel-red/40"
                : "bg-purple-900/40 text-purple-200 border border-purple-500/30"
              : "bg-black/30 text-gray-400 border border-white/5"
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {vehicle.geofence.in_zone
                ? vehicle.geofence.zone_name
                : `Clear of School Zones (${vehicle.geofence.nearest_zone_dist_m}m to nearest)`}
            </span>
          </div>
          {vehicle.geofence.in_zone && (
            <span className="shrink-0 font-bold px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white">
              LIMIT: {vehicle.geofence.speed_limit_mph} MPH
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
