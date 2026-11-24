import React from "react";
import type { VehicleStatus } from "../../types/telemetry";

interface StatusChipProps {
  status: VehicleStatus;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  switch (status) {
    case "CRITICAL_VIOLATION":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide bg-sentinel-red/20 text-sentinel-red border border-sentinel-red/40 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-sentinel-red" />
          VIOLATION
        </span>
      );
    case "WARNING_ISSUED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          WARNED
        </span>
      );
    case "SUPERVISOR_DISPATCHED":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          DISPATCHED
        </span>
      );
    case "ZONE_COMPLIANT":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          ZONE SAFE
        </span>
      );
    case "APPROACHING_ZONE":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          APPROACHING
        </span>
      );
    case "SAFE":
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-white/5 text-gray-400 border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          TRANSIT
        </span>
      );
  }
};
