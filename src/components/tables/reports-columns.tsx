"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportWithJoins } from "@/lib/queries/reports";
import {
  getReportStatusColor,
  getReportSeverityColor,
} from "@/lib/utils/status-colors";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import Link from "next/link";

interface ColumnsProps {
  onViewDetail: (report: ReportWithJoins) => void;
}

export function getReportsColumns({
  onViewDetail,
}: ColumnsProps): ColumnDef<ReportWithJoins>[] {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("reports");

  return [
    {
      accessorKey: "flights.flight_number",
      header: t("columns.flight"),
      cell: ({ row }) => row.original.flights?.flight_number || "—",
    },
    {
      accessorKey: "tasks.units.name",
      header: t("columns.unit"),
      cell: ({ row }) => {
        const task = row.original.tasks as any;
        return task?.units?.name || "—";
      },
    },
    {
      accessorKey: "tasks.service_types.name",
      header: t("columns.serviceType"),
      cell: ({ row }) => {
        const task = row.original.tasks as any;
        return task?.service_types?.name || "—";
      },
    },
    {
      accessorKey: "type",
      header: t("columns.type"),
    },
    {
      accessorKey: "severity",
      header: t("columns.severity"),
      cell: ({ row }) => {
        const severity = row.original.severity;
        const color = getReportSeverityColor(severity);
        return (
          <Badge
            tone={color.text}
            toneBg={color.bg}
            toneBorder={color.border}
          >
            {severity}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("columns.status"),
      cell: ({ row }) => {
        const status = row.original.status;
        const color = getReportStatusColor(status);
        return (
          <Badge
            tone={color.text}
            toneBg={color.bg}
            toneBorder={color.border}
            dot
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "users.full_name",
      header: t("columns.reportedBy"),
      cell: ({ row }) => (row.original.users as any)?.full_name || "—",
    },
    {
      accessorKey: "created_at",
      header: t("columns.date"),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
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
          <Link href={`/reports/${report.id}`}>
            <Button variant="text" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        );
      },
    },
  ];
}
