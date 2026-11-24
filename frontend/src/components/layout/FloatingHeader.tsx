import React, { useState } from "react";
import { Volume2, VolumeX, Zap, Terminal } from "lucide-react";
import { ConnectionStatus } from "../common/ConnectionStatus";
import type { ConnectionState } from "../../services/websocket";
import { soundManager } from "../../utils/audio";

interface FloatingHeaderProps {
  connectionState: ConnectionState;
  activeViolationsCount: number;
  auditLogsCount: number;
  onTriggerDemoViolation: () => void;
  onToggleAuditDrawer: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  connectionState,
  activeViolationsCount,
  auditLogsCount,
  onTriggerDemoViolation,
  onToggleAuditDrawer
}) => {
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    soundManager.setSoundEnabled(next);
  };

  return (
    <header className="absolute top-3.5 left-3.5 right-3.5 z-30 pointer-events-none select-none flex items-center justify-between gap-2.5">
      {/* Brand Capsule (Frosted Glass) */}
      <div className="frosted-glass pointer-events-auto px-3.5 py-2 rounded-2xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-black/40 border border-sentinel-cyan/50 flex items-center justify-center shadow-glow-cyan/40">
          <span className="w-2.5 h-2.5 rounded-full bg-sentinel-cyan animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider text-white font-mono uppercase">
              Sentinel
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-sentinel-cyan/15 text-sentinel-cyan border border-sentinel-cyan/30">
              LIVE
            </span>
          </div>
          <div className="text-[10px] text-gray-400 font-mono">Bengaluru Metro Hub</div>
        </div>

        <div className="hidden sm:block pl-2 border-l border-white/10">
          <ConnectionStatus status={connectionState} />
        </div>
      </div>

      {/* Right Controls (Frosted Glass) */}
      <div className="frosted-glass pointer-events-auto px-3 py-1.5 rounded-2xl flex items-center gap-2">
        {/* Simulate Violation Quick Trigger */}
        <button
          onClick={onTriggerDemoViolation}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sentinel-red/20 hover:bg-sentinel-red/30 border border-sentinel-red/40 text-sentinel-red text-xs font-mono font-bold transition-all hover:scale-105"
          title="Simulate Speed Violation Incident"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SIMULATE</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleAudio}
          className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title={audioEnabled ? "Mute Acoustic Alerts" : "Unmute Acoustic Alerts"}
          aria-label={audioEnabled ? "Mute Acoustic Alerts" : "Unmute Acoustic Alerts"}
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4 text-sentinel-cyan" />
          ) : (
            <VolumeX className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Compliance Drawer Toggle */}
        <button
          onClick={onToggleAuditDrawer}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs font-bold transition-all ${
            activeViolationsCount > 0
              ? "bg-sentinel-red text-white shadow-glow-red animate-pulse"
              : "bg-white/10 hover:bg-white/15 text-gray-200"
          }`}
          title="Toggle Compliance Feed"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">LOGS</span>
          <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
            {activeViolationsCount > 0 ? `${activeViolationsCount} ALERT` : auditLogsCount}
          </span>
        </button>
      </div>
    </header>
  );
};
