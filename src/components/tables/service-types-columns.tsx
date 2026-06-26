"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import type { ServiceType } from "@/lib/types/database";

interface ServiceTypeColumnProps {
  onEdit: (row: ServiceType) => void;
  onDelete: (row: ServiceType) => void;
}

export function getServiceTypeColumns(props: ServiceTypeColumnProps): ColumnDef<ServiceType>[] {
  return [
    {
      accessorKey: "name",
      header: "Service Type",
      cell: (info) => {
        const value = info.getValue<string>();
        return <span className="font-medium">{value}</span>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => {
        const value = info.getValue<string | undefined>();
        return <span className="text-text-secondary text-sm">{value || "—"}</span>;
      },
    },
    {
      accessorKey: "default_duration_minutes",
      header: "Default Duration",
      cell: (info) => {
        const value = info.getValue<number>();
        return <span>{value} min</span>;
      },
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: (info) => {
        const value = info.getValue<string | undefined>();
        return <span className="text-text-secondary text-sm">{value || "—"}</span>;
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
