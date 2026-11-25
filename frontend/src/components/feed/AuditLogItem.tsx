import React from "react";
import { AlertTriangle, CheckCircle2, AlertCircle, Info } from "lucide-react";
import type { AuditLogEntry } from "../../types/audit";

interface AuditLogItemProps {
  log: AuditLogEntry;
}

export const AuditLogItem: React.FC<AuditLogItemProps> = ({ log }) => {
  const isCritical = log.severity === "CRITICAL";
  const isWarning = log.severity === "WARNING";
  const isSuccess = log.severity === "SUCCESS";

  const getIcon = () => {
    if (isCritical) return <AlertTriangle className="w-3.5 h-3.5 text-sentinel-red shrink-0 mt-0.5" />;
    if (isWarning) return <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
    if (isSuccess) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
    return <Info className="w-3.5 h-3.5 text-sentinel-cyan shrink-0 mt-0.5" />;
  };

  return (
    <div
      className={`p-2.5 rounded-lg border font-mono text-xs transition-all ${
        isCritical
          ? "bg-sentinel-red/10 border-sentinel-red/40 text-red-100 shadow-glow-red/20"
          : isWarning
          ? "bg-amber-500/10 border-amber-500/30 text-amber-100"
          : isSuccess
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-100"
          : "bg-obsidian-950/60 border-white/5 text-gray-300"
      }`}
    >
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-gray-400 font-semibold">[{log.timestamp}]</span>
            {log.unit_id && (
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isCritical ? "bg-sentinel-red/30 text-sentinel-red" : "bg-white/10 text-gray-300"
              }`}>
                {log.unit_id}
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed break-words">
            {log.message}
          </p>
          {log.zone_name && (
            <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1.5">
              <span>Zone: {log.zone_name}</span>
              {log.speed_mph && (
                <span>• Speed: {log.speed_mph} mph (Limit {log.speed_limit_mph} mph)</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
