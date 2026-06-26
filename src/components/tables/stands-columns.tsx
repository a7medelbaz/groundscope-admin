"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Stand } from "@/lib/types/database";

interface StandsColumnProps {
  onEdit: (row: Stand) => void;
  onDelete: (row: Stand) => void;
}

export function getStandsColumns(props: StandsColumnProps): ColumnDef<Stand>[] {
  return [
    {
      accessorKey: "code",
      header: "Stand Code",
      cell: (info) => {
        const value = info.getValue<string>();
        return <span className="font-bold text-primary-200">{value}</span>;
      },
    },
    {
      accessorKey: "terminal",
      header: "Terminal",
      cell: (info) => {
        const value = info.getValue<string>();
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      accessorKey: "compatible_aircraft",
      header: "Compatible Aircraft",
      cell: (info) => {
        const value = info.getValue<string[] | null>();
        if (!value || value.length === 0) return <span className="text-text-hint">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((aircraft) => (
              <Badge key={aircraft} tone="text-info" toneBg="bg-info/15" toneBorder="border-info/30" className="text-xs">
                {aircraft}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "has_camera",
      header: "Camera",
      cell: (info) => {
        const value = info.getValue<boolean>();
        return (
          <Badge
            tone={value ? "text-success" : "text-text-disabled"}
            toneBg={value ? "bg-success/15" : "bg-text-disabled/15"}
            toneBorder={value ? "border-success/30" : "border-text-disabled/30"}
          >
            {value ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (info) => {
        const value = info.getValue<string>();
        return (
          <span className="text-text-secondary text-sm">
            {new Date(value).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
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
