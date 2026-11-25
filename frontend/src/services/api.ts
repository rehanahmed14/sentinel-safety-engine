import type { SchoolZoneCollection } from "../types/geofence";
import type { AuditLogEntry, DispatchActionPayload } from "../types/audit";

const getApiBase = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  return "http://localhost:8000/api";
};

const API_BASE = getApiBase();

export async function fetchSchoolZones(): Promise<SchoolZoneCollection> {
  const res = await fetch(`${API_BASE}/zones`);
  if (!res.ok) {
    throw new Error(`Failed to load school zones: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAuditLogs(limit: number = 50, severity?: string): Promise<AuditLogEntry[]> {
  const url = new URL(`${API_BASE}/audit-logs`);
  url.searchParams.set("limit", limit.toString());
  if (severity) {
    url.searchParams.set("severity", severity);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch audit logs: ${res.statusText}`);
  }
  const data = await res.json();
  return data.logs;
}

export function getAuditExportUrl(): string {
  return `${API_BASE}/audit-logs/export`;
}

export async function sendSimulationControl(action: string, params: Record<string, unknown> = {}): Promise<void> {
  const res = await fetch(`${API_BASE}/simulation/control`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: jsonPayload({ action, params })
  });
  if (!res.ok) {
    throw new Error(`Simulation control failed: ${res.statusText}`);
  }
}

export async function issueAutomatedWarning(payload: DispatchActionPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/dispatcher/warning`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: jsonPayload(payload)
  });
  if (!res.ok) {
    throw new Error(`Failed to issue automated warning: ${res.statusText}`);
  }
}

export async function dispatchSupervisor(payload: DispatchActionPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/dispatcher/supervisor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: jsonPayload(payload)
  });
  if (!res.ok) {
    throw new Error(`Failed to dispatch supervisor: ${res.statusText}`);
  }
}

function jsonPayload(obj: unknown): string {
  return JSON.stringify(obj);
}
