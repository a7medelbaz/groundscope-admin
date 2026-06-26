"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/lib/types/database";

interface UsersColumnProps {
  onEdit: (row: User) => void;
  onDelete: (row: User) => void;
}

const roleBadgeMap = {
  admin: { text: "text-primary-200", bg: "bg-primary-200/15", border: "border-primary-200/30" },
  supervisor: { text: "text-info", bg: "bg-info/15", border: "border-info/30" },
  unit_manager: { text: "text-success", bg: "bg-success/15", border: "border-success/30" },
};

export function getUsersColumns(props: UsersColumnProps): ColumnDef<User>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Name",
      cell: (info) => {
        const value = info.getValue<string>();
        return <span className="font-semibold text-text-primary">{value}</span>;
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => {
        const value = info.getValue<string>();
        return <span className="text-sm text-text-secondary">{value}</span>;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => {
        const value = info.getValue<string>();
        const tone = roleBadgeMap[value as keyof typeof roleBadgeMap];
        return (
          <Badge tone={tone.text} toneBg={tone.bg} toneBorder={tone.border}>
            {value === "admin"
              ? "Admin"
              : value === "supervisor"
                ? "Supervisor"
                : "Unit Manager"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: (info) => {
        const value = info.getValue<string | null>();
        return <span className="text-sm text-text-secondary">{value || "—"}</span>;
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
