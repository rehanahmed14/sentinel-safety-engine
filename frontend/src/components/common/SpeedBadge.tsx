import React from "react";

interface SpeedBadgeProps {
  speedMph: number;
  speedKmh: number;
  limitMph?: number | null;
  isViolation?: boolean;
  size?: "sm" | "md" | "lg";
}

export const SpeedBadge: React.FC<SpeedBadgeProps> = ({
  speedMph,
  speedKmh,
  limitMph,
  isViolation = false,
  size = "md"
}) => {
  const isOver = isViolation || (limitMph ? speedMph > limitMph : false);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base font-semibold"
  };

  return (
    <div
      className={`inline-flex items-baseline gap-1.5 rounded font-mono transition-colors ${sizeClasses[size]} ${
        isOver
          ? "bg-red-950/80 text-sentinel-red border border-sentinel-red/40 shadow-glow-red animate-pulse"
          : "bg-obsidian-800/90 text-sentinel-cyan border border-sentinel-cyan/30"
      }`}
    >
      <span className="font-bold tracking-tight">{speedMph.toFixed(0)}</span>
      <span className="text-[10px] text-gray-400 font-sans uppercase">mph</span>
      <span className="text-gray-500 font-sans text-[11px]">/</span>
      <span className="text-gray-400 text-xs">{speedKmh.toFixed(0)}</span>
      <span className="text-[9px] text-gray-500 font-sans uppercase">km/h</span>
    </div>
  );
};
