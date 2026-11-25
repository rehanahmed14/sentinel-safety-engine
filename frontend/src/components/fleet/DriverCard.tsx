import React from "react";
import { Truck, Navigation, School, AlertCircle } from "lucide-react";
import type { VehicleTelemetry } from "../../types/telemetry";
import { SpeedBadge } from "../common/SpeedBadge";
import { StatusChip } from "../common/StatusChip";

interface DriverCardProps {
  vehicle: VehicleTelemetry;
  isSelected: boolean;
  onSelect: (unitId: string) => void;
}

export const DriverCard: React.FC<DriverCardProps> = ({
  vehicle,
  isSelected,
  onSelect
}) => {
  const isViolation = vehicle.status === "CRITICAL_VIOLATION";
  const inZone = vehicle.geofence.in_zone;

  return (
    <div
      onClick={() => onSelect(vehicle.unit_id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(vehicle.unit_id);
        }
      }}
      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-sentinel-cyan focus:outline-none ${
        isViolation
          ? "bg-sentinel-red/20 border-2 border-sentinel-red/80 shadow-glow-red"
          : isSelected
          ? "bg-sentinel-cyan/15 border border-sentinel-cyan/60 shadow-glow-cyan/40"
          : "frosted-glass-card hover:bg-white/[0.08] hover:border-white/20"
      }`}
    >
      {/* Top row: Unit ID & Status Chip */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Truck className={`w-3.5 h-3.5 ${isViolation ? "text-sentinel-red" : "text-sentinel-cyan"}`} />
          <span className="font-mono text-xs font-bold text-white tracking-wide">
            {vehicle.unit_id}
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            ({vehicle.driver_id})
          </span>
        </div>
        <StatusChip status={vehicle.status} />
      </div>

      {/* Driver Name & Fleet */}
      <div className="mb-2">
        <div className="text-xs font-bold text-gray-100 flex items-center justify-between">
          <span>{vehicle.driver_name}</span>
          <span className="font-mono text-[10px] font-normal text-gray-400">
            {vehicle.vehicle_id}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 truncate">
          {vehicle.fleet} • {vehicle.vehicle_type}
        </div>
      </div>

      {/* School Zone Context if active */}
      {inZone && vehicle.geofence.zone_name && (
        <div
          className={`mb-2 px-2 py-1 rounded-xl text-[10px] flex items-center justify-between font-medium ${
            isViolation
              ? "bg-sentinel-red/30 text-white border border-sentinel-red/40"
              : "bg-purple-900/40 text-purple-200 border border-purple-500/30"
          }`}
        >
          <div className="flex items-center gap-1 truncate">
            {isViolation ? (
              <AlertCircle className="w-3 h-3 text-sentinel-red shrink-0" />
            ) : (
              <School className="w-3 h-3 text-purple-300 shrink-0" />
            )}
            <span className="truncate">{vehicle.geofence.zone_name}</span>
          </div>
          <span className="shrink-0 font-mono text-[9px] bg-black/50 px-1 py-0.2 rounded font-bold">
            {vehicle.geofence.speed_limit_mph} MPH
          </span>
        </div>
      )}

      {/* Bottom Metrics: Speed & Bearing */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <SpeedBadge
          speedMph={vehicle.speed_mph}
          speedKmh={vehicle.speed_kmh}
          limitMph={vehicle.geofence.speed_limit_mph}
          isViolation={isViolation}
          size="sm"
        />

        <div className="flex items-center gap-1 font-mono text-[10px] text-gray-400">
          <Navigation
            className="w-3 h-3 text-sentinel-cyan"
            style={{ transform: `rotate(${vehicle.bearing}deg)` }}
          />
          <span>{Math.round(vehicle.bearing)}°</span>
        </div>
      </div>
    </div>
  );
};
