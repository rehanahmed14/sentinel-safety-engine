import React, { useState, useMemo } from "react";
import { Terminal, Download, ShieldCheck, Filter } from "lucide-react";
import type { AuditLogEntry } from "../../types/audit";
import { AuditLogItem } from "./AuditLogItem";
import { getAuditExportUrl } from "../../services/api";

interface ComplianceFeedProps {
  logs: AuditLogEntry[];
  hasCriticalViolation: boolean;
}

export const ComplianceFeed: React.FC<ComplianceFeedProps> = ({
  logs,
  hasCriticalViolation
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const filteredLogs = useMemo(() => {
    if (filterSeverity === "ALL") return logs;
    return logs.filter((l) => l.severity === filterSeverity);
  }, [logs, filterSeverity]);

  // Separate pinned critical violations
  const pinnedViolations = useMemo(() => {
    return logs.filter((l) => l.severity === "CRITICAL").slice(0, 2);
  }, [logs]);

  const handleExportCSV = () => {
    try {
      window.open(getAuditExportUrl(), "_blank");
    } catch {
      const headers = "ID,Timestamp,Severity,Unit,Driver,Zone,Speed(MPH),Limit(MPH),Message\n";
      const rows = logs.map(l => 
        `"${l.id}","${l.timestamp}","${l.severity}","${l.unit_id || ''}","${l.driver_name || ''}","${l.zone_name || ''}","${l.speed_mph || ''}","${l.speed_limit_mph || ''}","${l.message.replace(/"/g, '""')}"`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sentinel_compliance_feed_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-obsidian-900 border-l border-white/10 select-none overflow-hidden transition-colors duration-500 ${
        hasCriticalViolation ? "ring-2 ring-sentinel-red/50 ring-inset bg-red-950/20" : ""
      }`}
    >
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sentinel-cyan" />
            <h2 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase">
              Compliance Feed
            </h2>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-sentinel-cyan focus:outline-none"
            title="Export session audit logs as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <Filter className="w-3 h-3 text-gray-500 mr-1" />
          <button
            onClick={() => setFilterSeverity("ALL")}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterSeverity === "ALL"
                ? "bg-white/15 text-white font-medium"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilterSeverity("CRITICAL")}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterSeverity === "CRITICAL"
                ? "bg-sentinel-red/20 text-sentinel-red border border-sentinel-red/30 font-medium"
                : "text-gray-400 hover:text-sentinel-red"
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity("WARNING")}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterSeverity === "WARNING"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium"
                : "text-gray-400 hover:text-amber-300"
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilterSeverity("SUCCESS")}
            className={`px-2 py-0.5 rounded transition-colors ${
              filterSeverity === "SUCCESS"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium"
                : "text-gray-400 hover:text-emerald-300"
            }`}
          >
            Pass OK
          </button>
        </div>
      </div>

      {/* Pinned Critical Alert Notification */}
      {hasCriticalViolation && pinnedViolations.length > 0 && (
        <div className="p-2.5 bg-sentinel-red/15 border-b border-sentinel-red/40 shrink-0">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-sentinel-red flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sentinel-red animate-ping" />
              PINNED CRITICAL ALERT
            </span>
            <span>ACTIVE INCIDENT</span>
          </div>
          <AuditLogItem log={pinnedViolations[0]} />
        </div>
      )}

      {/* Scrolling Audit Log List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs font-mono">
            <ShieldCheck className="w-6 h-6 mx-auto mb-2 opacity-40 text-emerald-400" />
            No flagged compliance logs for this filter.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <AuditLogItem key={log.id} log={log} />
          ))
        )}
      </div>

      {/* Live Terminal Status Bar Footer */}
      <div className="p-2.5 border-t border-white/5 bg-obsidian-950 font-mono text-[10px] text-gray-500 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan" />
          <span>GEOFENCE AUDIT DAEMON</span>
        </span>
        <span>BUFFER: {logs.length}/1000</span>
      </div>
    </div>
  );
};
