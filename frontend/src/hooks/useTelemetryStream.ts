import { useState, useEffect, useCallback, useRef } from "react";
import { wsService } from "../services/websocket";
import type { ConnectionState } from "../services/websocket";
import type { VehicleTelemetry, CriticalViolationEvent, TelemetryFrame, SimulationMetadata } from "../types/telemetry";
import type { AuditLogEntry, DispatchActionPayload } from "../types/audit";
import { soundManager } from "../utils/audio";
import { issueAutomatedWarning, dispatchSupervisor } from "../services/api";

export function useTelemetryStream() {
  const [vehicles, setVehicles] = useState<VehicleTelemetry[]>([]);
  const [activeViolation, setActiveViolation] = useState<CriticalViolationEvent | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>("UNIT-01");
  const [connectionState, setConnectionState] = useState<ConnectionState>("DISCONNECTED");
  
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(120);

  // Track if modal was manually dismissed for the current violation event
  const dismissedViolationRef = useRef<string | null>(null);

  // Local fallback simulation data ref if WS is offline
  const fallbackDataRef = useRef<any>(null);
  const localTimerRef = useRef<number | null>(null);

  const handleFrame = useCallback((frame: TelemetryFrame) => {
    setCurrentStep(frame.step);
    if (frame.total_steps) setTotalSteps(frame.total_steps);
    setVehicles(frame.vehicles);

    // Merge audit logs
    if (frame.recent_audit_logs && frame.recent_audit_logs.length > 0) {
      setAuditLogs(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const newOnes = frame.recent_audit_logs.filter(l => !existingIds.has(l.id)) as unknown as AuditLogEntry[];
        if (newOnes.length > 0) {
          return [...newOnes, ...prev].slice(0, 200);
        }
        return prev;
      });
    }

    // Check violations
    if (frame.active_violations && frame.active_violations.length > 0) {
      const topViolation = frame.active_violations[0];
      const violationKey = `${topViolation.unit_id}-${topViolation.zone_id}-${Math.floor(frame.step / 5)}`;
      
      if (dismissedViolationRef.current !== violationKey) {
        setActiveViolation(topViolation);
        soundManager.playViolationAlarm();
      }
    } else {
      setActiveViolation(null);
      dismissedViolationRef.current = null;
    }
  }, []);

  const handleMetadata = useCallback((meta: SimulationMetadata) => {
    if (meta.total_steps) setTotalSteps(meta.total_steps);
    setIsPlaying(meta.is_playing);
    setSpeedMultiplier(meta.speed_multiplier);
  }, []);

  // Connect to WebSocket and listen
  useEffect(() => {
    wsService.connect();
    const unsubStatus = wsService.onStatus(setConnectionState);
    const unsubFrame = wsService.onFrame(handleFrame);
    const unsubMeta = wsService.onMetadata(handleMetadata);

    return () => {
      unsubStatus();
      unsubFrame();
      unsubMeta();
      wsService.disconnect();
    };
  }, [handleFrame, handleMetadata]);

  // Fallback local simulation if backend is launching or unreachable
  useEffect(() => {
    if (connectionState === "CONNECTED") {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }
      return;
    }

    // Load local json if not loaded yet
    if (!fallbackDataRef.current) {
      fetch("/data/bengaluru_trajectories.json")
        .then(res => res.json())
        .then(data => {
          fallbackDataRef.current = data;
          if (data.vehicles && data.vehicles.length > 0) {
            setTotalSteps(Math.max(...data.vehicles.map((v: any) => v.waypoints.length)));
          }
        })
        .catch(() => {});
    }

    // Local tick generator
    if (!localTimerRef.current) {
      localTimerRef.current = window.setInterval(() => {
        if (!fallbackDataRef.current || !fallbackDataRef.current.vehicles) return;
        if (!isPlaying) return;

        setCurrentStep(prev => {
          const nextStep = prev + 1 >= totalSteps ? 0 : prev + 1;
          const vehiclesSnapshot: VehicleTelemetry[] = fallbackDataRef.current.vehicles.map((v: any) => {
            const wp = v.waypoints[Math.min(nextStep, v.waypoints.length - 1)];
            const isSpeeding = wp.speed_mph > 15;
            const inMarcusZone = v.unit_id === "UNIT-01" && nextStep >= 6 && nextStep <= 18;
            const inBethanyZone = v.unit_id === "UNIT-04" && nextStep >= 7 && nextStep <= 17;
            const inZone = inMarcusZone || inBethanyZone;
            const isViolation = inZone && isSpeeding;

            return {
              unit_id: v.unit_id,
              driver_id: v.driver_id,
              driver_name: v.driver_name,
              vehicle_id: v.vehicle_id,
              vehicle_type: v.vehicle_type,
              fleet: v.fleet,
              assigned_route: v.assigned_route,
              longitude: wp.longitude,
              latitude: wp.latitude,
              speed_mph: wp.speed_mph,
              speed_kmh: wp.speed_kmh,
              bearing: wp.bearing,
              timestamp: wp.timestamp,
              status: isViolation ? "CRITICAL_VIOLATION" : inZone ? "ZONE_COMPLIANT" : "SAFE",
              warning_sent: false,
              supervisor_sent: false,
              geofence: {
                in_zone: inZone,
                is_violation: isViolation,
                zone_id: inMarcusZone ? "BLR-SCH-001" : inBethanyZone ? "BLR-SCH-005" : null,
                zone_name: inMarcusZone ? "Bishop Cotton Boys' School" : inBethanyZone ? "Bethany High School" : null,
                speed_limit_mph: 15,
                speed_limit_kmh: 25,
                excess_mph: isViolation ? Math.round(wp.speed_mph - 15) : 0,
                excess_kmh: isViolation ? Math.round(wp.speed_kmh - 25) : 0,
                status: isViolation ? "CRITICAL_VIOLATION" : inZone ? "ZONE_COMPLIANT" : "SAFE",
                risk_level: isViolation ? "CRITICAL" : "NORMAL",
                nearest_zone_dist_m: inZone ? 0 : 120
              }
            };
          });

          setVehicles(vehiclesSnapshot);

          const viol = vehiclesSnapshot.find(v => v.status === "CRITICAL_VIOLATION");
          if (viol) {
            setActiveViolation({
              unit_id: viol.unit_id,
              driver_id: viol.driver_id,
              driver_name: viol.driver_name,
              vehicle_id: viol.vehicle_id,
              vehicle_type: viol.vehicle_type,
              fleet: viol.fleet,
              current_speed_mph: viol.speed_mph,
              current_speed_kmh: viol.speed_kmh,
              speed_limit_mph: 15,
              speed_limit_kmh: 25,
              excess_mph: Math.max(0, viol.speed_mph - 15),
              excess_kmh: Math.max(0, viol.speed_kmh - 25),
              zone_id: viol.geofence.zone_id || "BLR-SCH-001",
              zone_name: viol.geofence.zone_name || "Bishop Cotton Boys' School",
              longitude: viol.longitude,
              latitude: viol.latitude,
              warning_sent: false,
              supervisor_sent: false
            });
          } else {
            setActiveViolation(null);
          }

          return nextStep;
        });
      }, 1000 / speedMultiplier);
    }

    return () => {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }
    };
  }, [connectionState, isPlaying, speedMultiplier, totalSteps]);

  // Controls
  const togglePlay = useCallback(() => {
    const next = !isPlaying;
    setIsPlaying(next);
    wsService.sendCommand("toggle_play");
  }, [isPlaying]);

  const setSpeed = useCallback((speed: number) => {
    setSpeedMultiplier(speed);
    wsService.sendCommand("set_speed", { speed });
  }, []);

  const seekStep = useCallback((step: number) => {
    setCurrentStep(step);
    wsService.sendCommand("seek", { step });
  }, []);

  const resetSimulation = useCallback(() => {
    setCurrentStep(0);
    setActiveViolation(null);
    dismissedViolationRef.current = null;
    wsService.sendCommand("reset");
  }, []);

  const dismissViolationModal = useCallback(() => {
    if (activeViolation) {
      dismissedViolationRef.current = `${activeViolation.unit_id}-${activeViolation.zone_id}-${Math.floor(currentStep / 5)}`;
    }
    setActiveViolation(null);
  }, [activeViolation, currentStep]);

  const handleIssueWarning = useCallback(async (payload: DispatchActionPayload) => {
    soundManager.playWarningBeep();
    try {
      await issueAutomatedWarning(payload);
    } catch {
      wsService.sendCommand("issue_warning", payload as unknown as Record<string, unknown>);
    }
    if (activeViolation && activeViolation.unit_id === payload.unit_id) {
      setActiveViolation(prev => prev ? { ...prev, warning_sent: true } : null);
    }
    const logItem: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      iso_timestamp: new Date().toISOString(),
      event_type: "WARNING_ISSUED",
      severity: "WARNING",
      unit_id: payload.unit_id,
      driver_name: payload.driver_name,
      vehicle_id: payload.vehicle_id,
      zone_id: payload.zone_id,
      zone_name: payload.zone_name,
      speed_mph: payload.speed_mph,
      speed_kmh: payload.speed_kmh,
      speed_limit_mph: payload.speed_limit_mph,
      message: `IN-CAB WARNING ISSUED: Speed deceleration directive sent to ${payload.unit_id} (${payload.driver_name})`
    };
    setAuditLogs(prev => [logItem, ...prev]);
  }, [activeViolation]);

  const handleDispatchSupervisor = useCallback(async (payload: DispatchActionPayload) => {
    soundManager.playDispatchChime();
    try {
      await dispatchSupervisor(payload);
    } catch {
      wsService.sendCommand("dispatch_supervisor", payload as unknown as Record<string, unknown>);
    }
    if (activeViolation && activeViolation.unit_id === payload.unit_id) {
      setActiveViolation(prev => prev ? { ...prev, supervisor_sent: true } : null);
    }
    const logItem: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      iso_timestamp: new Date().toISOString(),
      event_type: "SUPERVISOR_DISPATCHED",
      severity: "CRITICAL",
      unit_id: payload.unit_id,
      driver_name: payload.driver_name,
      vehicle_id: payload.vehicle_id,
      zone_id: payload.zone_id,
      zone_name: payload.zone_name,
      speed_mph: payload.speed_mph,
      speed_kmh: payload.speed_kmh,
      speed_limit_mph: payload.speed_limit_mph,
      message: `SUPERVISOR DISPATCHED: Mobile patrol unit en route to intercept ${payload.unit_id} (${payload.driver_name}) at ${payload.zone_name}`
    };
    setAuditLogs(prev => [logItem, ...prev]);
  }, [activeViolation]);

  // Quick jump directly to the critical violation moment (Step 50, Marcus Johnson inside Bishop Cotton Boys' School at 32 MPH)
  const jumpToViolation = useCallback(() => {
    seekStep(50);
    setSelectedUnitId("UNIT-01");
  }, [seekStep]);

  return {
    vehicles,
    activeViolation,
    auditLogs,
    selectedUnitId,
    setSelectedUnitId,
    connectionState,
    isPlaying,
    speedMultiplier,
    currentStep,
    totalSteps,
    togglePlay,
    setSpeed,
    seekStep,
    resetSimulation,
    dismissViolationModal,
    handleIssueWarning,
    handleDispatchSupervisor,
    jumpToViolation
  };
}
