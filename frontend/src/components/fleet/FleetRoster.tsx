import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Users, Building2 } from "lucide-react";
import type { VehicleTelemetry } from "../../types/telemetry";
import { DriverCard } from "./DriverCard";

interface FleetRosterProps {
  vehicles: VehicleTelemetry[];
  selectedUnitId: string | null;
  onSelectUnit: (unitId: string) => void;
}

export const FleetRoster: React.FC<FleetRosterProps> = ({
  vehicles,
  selectedUnitId,
  onSelectUnit
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"ALL" | "VIOLATIONS" | "ZONES" | "SAFE">("ALL");
  const [selectedCompany, setSelectedCompany] = useState<string>("ALL_COMPANIES");

  // Extract unique fleet companies
  const companyList = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.fleet) set.add(v.fleet);
    });
    return Array.from(set);
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Company Filter
      if (selectedCompany !== "ALL_COMPANIES" && v.fleet !== selectedCompany) {
        return false;
      }

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        v.driver_id.toLowerCase().includes(q) ||
        v.unit_id.toLowerCase().includes(q) ||
        v.driver_name.toLowerCase().includes(q) ||
        v.vehicle_id.toLowerCase().includes(q) ||
        v.fleet.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Status Filter
      if (filterType === "VIOLATIONS") {
        return v.status === "CRITICAL_VIOLATION";
      }
      if (filterType === "ZONES") {
        return v.geofence.in_zone;
      }
      if (filterType === "SAFE") {
        return v.status === "SAFE" || v.status === "ZONE_COMPLIANT";
      }
      return true;
    });
  }, [vehicles, searchQuery, filterType, selectedCompany]);

  const violationCount = vehicles.filter(v => v.status === "CRITICAL_VIOLATION").length;

  return (
    <div className="h-full flex flex-col bg-obsidian-900 border-r border-white/10 select-none overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/10 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sentinel-cyan" />
            <h2 className="text-xs font-bold tracking-wider font-mono text-gray-200 uppercase">
              Active Fleet Roster
            </h2>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
            {filteredVehicles.length}/{vehicles.length} Units
          </span>
        </div>

        {/* Company / Fleet Operator Selector */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-obsidian-950/90 rounded-lg border border-white/10 text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-sentinel-cyan shrink-0" />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-transparent text-gray-200 text-xs font-mono focus:outline-none cursor-pointer"
              aria-label="Filter by Company Fleet"
            >
              <option value="ALL_COMPANIES" className="bg-obsidian-950 text-gray-200">
                All Companies / 3PL Carriers ({vehicles.length})
              </option>
              {companyList.map((company) => {
                const count = vehicles.filter((v) => v.fleet === company).length;
                return (
                  <option key={company} value={company} className="bg-obsidian-950 text-gray-200">
                    {company} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Search input: matches PRD "Input field to search by Driver ID" */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Driver ID or Name..."
            className="w-full bg-obsidian-950/90 text-xs font-mono text-gray-100 pl-8 pr-3 py-1.5 rounded-lg border border-white/10 placeholder-gray-500 focus:outline-none focus:border-sentinel-cyan focus:ring-1 focus:ring-sentinel-cyan transition-all"
            aria-label="Search by Driver ID or Name"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              aria-label="Clear Search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 text-[11px] font-mono pt-0.5">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-2 py-1 rounded transition-colors ${
              filterType === "ALL"
                ? "bg-white/15 text-white font-medium"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("VIOLATIONS")}
            className={`px-2 py-1 rounded transition-colors flex items-center gap-1 ${
              filterType === "VIOLATIONS"
                ? "bg-sentinel-red/20 text-sentinel-red border border-sentinel-red/40 font-medium"
                : "text-gray-400 hover:text-sentinel-red hover:bg-white/5"
            }`}
          >
            Violations {violationCount > 0 && `(${violationCount})`}
          </button>
          <button
            onClick={() => setFilterType("ZONES")}
            className={`px-2 py-1 rounded transition-colors ${
              filterType === "ZONES"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-medium"
                : "text-gray-400 hover:text-purple-300 hover:bg-white/5"
            }`}
          >
            In Zone
          </button>
        </div>
      </div>

      {/* Vehicle Card List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredVehicles.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs font-mono">
            <SlidersHorizontal className="w-6 h-6 mx-auto mb-2 opacity-40" />
            No vehicles match the search criteria.
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
