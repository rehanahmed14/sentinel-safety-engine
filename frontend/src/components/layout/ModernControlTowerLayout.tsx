import React, { useState } from "react";
import { FloatingHeader } from "./FloatingHeader";
import { FloatingFleetCard } from "../fleet/FloatingFleetCard";
import { DriverRideSheet } from "../fleet/DriverRideSheet";
import { UniversalSentinelMap } from "../map/UniversalSentinelMap";
import { ComplianceDrawer } from "../feed/ComplianceDrawer";
import { useTelemetryStream } from "../../hooks/useTelemetryStream";

export const ModernControlTowerLayout: React.FC = () => {
  const {
    vehicles,
    activeViolation,
    auditLogs,
    selectedUnitId,
    setSelectedUnitId,
    connectionState,
    jumpToViolation
  } = useTelemetryStream();

  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState<boolean>(false);
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);

  const selectedVehicle = vehicles.find((v) => v.unit_id === selectedUnitId) || null;
  const activeViolationsCount = vehicles.filter((v) => v.status === "CRITICAL_VIOLATION").length;

  return (
    <div className="relative w-screen h-screen bg-obsidian-950 overflow-hidden select-none font-sans text-gray-100">
      {/* 1. Full-Screen Edge-to-Edge Hero Map (Universal Engine: Carto Dark / Google Maps) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <UniversalSentinelMap
          vehicles={vehicles}
          selectedUnitId={selectedUnitId}
          activeViolation={activeViolation}
          onSelectUnit={(id) => {
            setSelectedUnitId(id);
            setIsFollowMode(true);
          }}
        />
      </div>

      {/* 2. Floating Top Header Capsule (Frosted Glass) */}
      <FloatingHeader
        connectionState={connectionState}
        activeViolationsCount={activeViolationsCount}
        auditLogsCount={auditLogs.length}
        onTriggerDemoViolation={jumpToViolation}
        onToggleAuditDrawer={() => setIsAuditDrawerOpen(!isAuditDrawerOpen)}
      />

      {/* 3. Floating Fleet Navigator (Frosted Glass, Collapsible to a single pill) */}
      <FloatingFleetCard
        vehicles={vehicles}
        selectedUnitId={selectedUnitId}
        onSelectUnit={(id) => {
          setSelectedUnitId(id);
          setIsFollowMode(true);
        }}
      />

      {/* 4. Uber-style Driver Ride Focus Sheet (slides up at bottom when driver is tapped) */}
      <DriverRideSheet
        vehicle={selectedVehicle}
        isFollowMode={isFollowMode}
        onToggleFollow={() => setIsFollowMode(!isFollowMode)}
        onClose={() => setSelectedUnitId(null)}
      />

      {/* 5. Slide-Over Compliance Audit Drawer (Frosted Glass) */}
      <ComplianceDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={auditLogs}
        hasCriticalViolation={activeViolationsCount > 0}
      />
    </div>
  );
};
