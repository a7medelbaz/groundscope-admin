"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Flight } from "@/lib/types/database";
import { getFlightStatusColor } from "@/lib/utils/status-colors";

interface FlightsColumnProps {
  onView: (row: Flight) => void;
}

export function getFlightsColumns(props: FlightsColumnProps): ColumnDef<Flight>[] {
  return [
    {
      accessorKey: "flight_number",
      header: "Flight",
      cell: (info) => {
        const flight = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-control bg-primary-200/12 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-200">{flight.airline.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{info.getValue<string>()}</p>
              <p className="text-xs text-text-hint">{flight.airline}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "origin",
      header: "Route",
      cell: (info) => {
        const flight = info.row.original;
        return <span className="text-sm">{info.getValue<string>()} → {flight.destination}</span>;
      },
    },
    {
      accessorKey: "scheduled_arrival",
      header: "Scheduled",
      cell: (info) => {
        const date = new Date(info.getValue<string>());
        return (
          <span className="text-sm tabular-nums">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const value = info.getValue<string>();
        const tone = getFlightStatusColor(value as any);
        return (
          <Badge tone={tone.text} toneBg={tone.bg} toneBorder={tone.border}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "aircraft_type",
      header: "Aircraft",
      cell: (info) => <span className="text-sm text-text-secondary">{info.getValue<string>() || "—"}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        return (
          <button
            onClick={() => props.onView(row)}
            className="p-2 rounded-control hover:bg-info/10 text-info transition-colors"
            title="View details"
          >
            <Eye className="w-4 h-4" strokeWidth={2} />
          </button>
        );
      },
    },
  ];
}
