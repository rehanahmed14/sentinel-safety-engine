import React, { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Users, Building2, SlidersHorizontal, AlertTriangle } from "lucide-react";
import type { VehicleTelemetry } from "../../types/telemetry";
import { DriverCard } from "./DriverCard";

interface FloatingFleetCardProps {
  vehicles: VehicleTelemetry[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
}

export const FloatingFleetCard: React.FC<FloatingFleetCardProps> = ({
  vehicles,
  selectedUnitId,
  onSelectUnit
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "VIOLATIONS" | "ZONES">("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL_COMPANIES");

  // Extract companies
  const companyList = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.fleet) set.add(v.fleet);
    });
    return Array.from(set);
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (selectedCompany !== "ALL_COMPANIES" && v.fleet !== selectedCompany) {
        return false;
      }
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.driver_id.toLowerCase().includes(q) ||
        v.unit_id.toLowerCase().includes(q) ||
        v.driver_name.toLowerCase().includes(q) ||
        v.vehicle_id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterType === "VIOLATIONS") return v.status === "CRITICAL_VIOLATION";
      if (filterType === "ZONES") return v.geofence.in_zone;
      return true;
    });
  }, [vehicles, searchQuery, filterType, selectedCompany]);

  const violationCount = vehicles.filter((v) => v.status === "CRITICAL_VIOLATION").length;

  // Collapsed Minimalist Pill
  if (isCollapsed) {
    return (
      <div className="absolute top-18 left-3.5 z-20 pointer-events-auto select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className={`frosted-glass px-4 py-2.5 rounded-2xl flex items-center gap-2.5 font-mono text-xs transition-all hover:scale-105 ${
            violationCount > 0
              ? "border-sentinel-red/60 text-white shadow-glow-red animate-pulse"
              : "text-gray-200 hover:text-white"
          }`}
        >
          {violationCount > 0 ? (
            <AlertTriangle className="w-4 h-4 text-sentinel-red" />
          ) : (
            <Users className="w-4 h-4 text-sentinel-cyan" />
          )}
          <span className="font-bold">Active Fleet</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-bold">
            {filteredVehicles.length} Units
          </span>
          <ChevronDown className="w-4 h-4 ml-0.5 opacity-70" />
        </button>
      </div>
    );
  }

  // Expanded Frosted Glass Card
  return (
    <div className="absolute top-18 left-3.5 z-20 w-80 max-h-[calc(100vh-100px)] flex flex-col frosted-glass rounded-3xl pointer-events-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-white/10 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sentinel-cyan" />
            <h2 className="text-xs font-bold tracking-wider font-mono text-white uppercase">
              Fleet Roster
            </h2>
            <span className="font-mono text-[11px] px-2 py-0.2 rounded-full bg-white/10 text-gray-300">
              {filteredVehicles.length}/{vehicles.length}
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Minimize to floating pill"
            aria-label="Minimize Fleet List"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Company Dropdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 rounded-2xl border border-white/10 text-xs font-mono">
          <Building2 className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" />
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full bg-transparent text-gray-200 text-xs font-mono focus:outline-none cursor-pointer"
            aria-label="Filter by Carrier"
          >
            <option value="ALL_COMPANIES" className="bg-obsidian-950 text-gray-200">
              All Carriers ({vehicles.length})
            </option>
            {companyList.map((c) => (
              <option key={c} value={c} className="bg-obsidian-950 text-gray-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search driver or unit..."
            className="w-full bg-black/40 text-xs font-mono text-gray-100 pl-8 pr-3 py-1.5 rounded-2xl border border-white/10 placeholder-gray-500 focus:outline-none focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-2.5 py-0.5 rounded-xl transition-colors ${
              filterType === "ALL"
                ? "bg-white/20 text-white font-bold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("VIOLATIONS")}
            className={`px-2.5 py-0.5 rounded-xl transition-colors ${
              filterType === "VIOLATIONS"
                ? "bg-sentinel-red text-white font-bold shadow-glow-red"
                : "text-gray-400 hover:text-sentinel-red"
            }`}
          >
            Violations {violationCount > 0 && `(${violationCount})`}
          </button>
          <button
            onClick={() => setFilterType("ZONES")}
            className={`px-2.5 py-0.5 rounded-xl transition-colors ${
              filterType === "ZONES"
                ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30"
                : "text-gray-400 hover:text-purple-300"
            }`}
          >
            In Zone
          </button>
        </div>
      </div>

      {/* Driver Card List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredVehicles.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-xs font-mono">
            <SlidersHorizontal className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
            No drivers match filters.
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <DriverCard
              key={vehicle.unit_id}
              vehicle={vehicle}
              isSelected={selectedUnitId === vehicle.unit_id}
              onSelect={onSelectUnit}
            />
          ))
        )}
      </div>
    </div>
  );
};
