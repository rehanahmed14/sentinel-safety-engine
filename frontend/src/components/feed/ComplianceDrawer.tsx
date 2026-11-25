import React, { useState, useMemo } from "react";
import { X, Download, Terminal, Filter, ShieldCheck } from "lucide-react";
import type { AuditLogEntry } from "../../types/audit";
import { AuditLogItem } from "./AuditLogItem";
import { getAuditExportUrl } from "../../services/api";

interface ComplianceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  hasCriticalViolation: boolean;
}

export const ComplianceDrawer: React.FC<ComplianceDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  hasCriticalViolation
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");

  const filteredLogs = useMemo(() => {
    if (filterSeverity === "ALL") return logs;
    return logs.filter((l) => l.severity === filterSeverity);
  }, [logs, filterSeverity]);

  const handleExportCSV = () => {
    try {
      window.open(getAuditExportUrl(), "_blank");
    } catch {
      const headers = "ID,Timestamp,Severity,Unit,Driver,Zone,Speed(MPH),Limit(MPH),Message\n";
      const rows = logs
        .map(
          (l) =>
            `"${l.id}","${l.timestamp}","${l.severity}","${l.unit_id || ""}","${
              l.driver_name || ""
            }","${l.zone_name || ""}","${l.speed_mph || ""}","${l.speed_limit_mph || ""}","${l.message.replace(
              /"/g,
              '""'
            )}"`
        )
        .join("\n");
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

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer Sheet */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md frosted-glass-elevated z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 select-none ${
          hasCriticalViolation ? "border-sentinel-red/50 ring-2 ring-sentinel-red/40" : ""
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sentinel-cyan" />
              <div>
                <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                  Compliance Audit Trail
                </h2>
                <span className="text-[11px] text-gray-400 font-mono">
                  {logs.length} Total Events Logged
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-mono font-semibold transition-colors"
                title="Download CSV report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            <button
              onClick={() => setFilterSeverity("ALL")}
              className={`px-2.5 py-1 rounded-xl transition-colors ${
                filterSeverity === "ALL"
                  ? "bg-white/20 text-white font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity("CRITICAL")}
              className={`px-2.5 py-1 rounded-xl transition-colors ${
                filterSeverity === "CRITICAL"
                  ? "bg-sentinel-red text-white font-bold shadow-glow-red"
                  : "text-gray-400 hover:text-sentinel-red"
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity("WARNING")}
              className={`px-2.5 py-1 rounded-xl transition-colors ${
                filterSeverity === "WARNING"
                  ? "bg-amber-500/20 text-amber-300 font-bold"
                  : "text-gray-400 hover:text-amber-300"
              }`}
            >
              Warnings
            </button>
            <button
              onClick={() => setFilterSeverity("SUCCESS")}
              className={`px-2.5 py-1 rounded-xl transition-colors ${
                filterSeverity === "SUCCESS"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold"
                  : "text-gray-400 hover:text-emerald-400"
              }`}
            >
              Pass OK
            </button>
          </div>
        </div>

        {/* Audit List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-gray-500 text-xs font-mono">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
              No events found for this filter.
            </div>
          ) : (
            filteredLogs.map((log) => <AuditLogItem key={log.id} log={log} />)
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-black/40 font-mono text-[11px] text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sentinel-cyan" />
            <span>SENTINEL COMPLIANCE ENGINE</span>
          </span>
          <span>100% AUDIT READY</span>
        </div>
      </div>
    </>
  );
};
