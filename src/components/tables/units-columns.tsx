"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Unit } from "@/lib/types/database";
import { getUnitStatusColor } from "@/lib/utils/status-colors";

interface UnitsColumnProps {
  onView: (row: Unit) => void;
  onEdit: (row: Unit) => void;
  onDelete: (row: Unit) => void;
}

export function getUnitsColumns(props: UnitsColumnProps): ColumnDef<Unit>[] {
  return [
    {
      accessorKey: "name",
      header: "Unit Name",
      cell: (info) => (
        <span className="font-bold text-primary-200">{info.getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const value = info.getValue<string>();
        const tone = getUnitStatusColor(value as any);
        return (
          <Badge tone={tone.text} toneBg={tone.bg} toneBorder={tone.border}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "compatible_aircraft",
      header: "Aircraft",
      cell: (info) => {
        const value = info.getValue<string[] | null>();
        if (!value || value.length === 0) return <span className="text-text-hint">—</span>;
        return <span className="text-sm">{value.length} types</span>;
      },
    },
    {
      accessorKey: "shift_start_time",
      header: "Shift",
      cell: (info) => {
        const unit = info.row.original;
        if (!unit.shift_start_time || !unit.shift_end_time) {
          return <span className="text-text-hint text-sm">—</span>;
        }
        return (
          <span className="text-sm">
            {unit.shift_start_time} – {unit.shift_end_time}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (info) => (
        <span className="text-text-secondary text-sm">
          {new Date(info.getValue<string>()).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => props.onView(row)}
              className="p-2 rounded-control hover:bg-info/10 text-info transition-colors"
              title="View details"
            >
              <Eye className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => props.onEdit(row)}
              className="p-2 rounded-control hover:bg-primary-200/10 text-primary-200 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => props.onDelete(row)}
              className="p-2 rounded-control hover:bg-error/10 text-error transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        );
      },
    },
  ];
}
