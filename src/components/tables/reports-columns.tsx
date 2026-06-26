"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportWithJoins } from "@/lib/queries/reports";
import { getReportStatusColor, getReportSeverityColor } from "@/lib/utils/status-colors";
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsProps {
  onViewDetail: (report: ReportWithJoins) => void;
  onAcknowledge: (report: ReportWithJoins) => void;
  onResolve: (report: ReportWithJoins) => void;
}

export function getReportsColumns({
  onViewDetail,
  onAcknowledge,
  onResolve,
}: ColumnsProps): ColumnDef<ReportWithJoins>[] {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("reports.columns");

  return [
    {
      accessorKey: "flights.flight_number",
      header: t("flight"),
      cell: ({ row }) => row.original.flights?.flight_number || "—",
    },
    {
      accessorKey: "tasks.units.name",
      header: t("unit"),
      cell: ({ row }) => {
        const task = row.original.tasks as any;
        return task?.units?.name || "—";
      },
    },
    {
      accessorKey: "tasks.service_types.name",
      header: t("serviceType"),
      cell: ({ row }) => {
        const task = row.original.tasks as any;
        return task?.service_types?.name || "—";
      },
    },
    {
      accessorKey: "type",
      header: t("type"),
      cell: ({ row }) => row.getValue("type"),
    },
    {
      accessorKey: "severity",
      header: t("severity"),
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        const color = getReportSeverityColor(severity);
        return (
          <Badge variant="outline" className={color}>
            {severity}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const color = getReportStatusColor(status);
        return (
          <Badge variant="outline" className={color}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "users.full_name",
      header: t("reportedBy"),
      cell: ({ row }) => (row.original.users as any)?.full_name || "—",
    },
    {
      accessorKey: "created_at",
      header: t("date"),
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string);
        return date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetail(report)}>
                {t("view")}
              </DropdownMenuItem>
              {report.status === "open" && (
                <DropdownMenuItem onClick={() => onAcknowledge(report)}>
                  {t("acknowledge")}
                </DropdownMenuItem>
              )}
              {report.status !== "resolved" && (
                <DropdownMenuItem onClick={() => onResolve(report)}>
                  {t("resolve")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
