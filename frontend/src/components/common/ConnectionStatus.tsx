import React from "react";
import type { ConnectionState } from "../../services/websocket";

interface ConnectionStatusProps {
  status: ConnectionState;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const isLive = status === "CONNECTED";
  const isReconnecting = status === "RECONNECTING" || status === "CONNECTING";

  return (
    <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-black/40 border border-white/10" title={`Telemetry Stream: ${status}`}>
      <span className="relative flex h-2 w-2">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isLive
              ? "bg-emerald-400"
              : isReconnecting
              ? "bg-amber-400 animate-pulse"
              : "bg-red-500"
          }`}
        />
      </span>
      <span className="text-gray-300 tracking-tight">
        {isLive ? "LIVE STREAM" : isReconnecting ? "SYNCING..." : "STANDALONE"}
      </span>
    </div>
  );
};
