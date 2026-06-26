"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/hooks/useSession";
import { getReports, ReportWithJoins, acknowledgeReport, resolveReport } from "@/lib/queries/reports";
import { subscribeToReports } from "@/lib/queries/reports-client";
import { ReportDetailSheet } from "@/components/sections/report-detail-sheet";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { getReportsColumns } from "@/components/tables/reports-columns";
import { Download, Plus } from "lucide-react";
import { ReportSeverity, ReportStatus } from "@/lib/types/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterState {
  status: ReportStatus[];
  severity: ReportSeverity[];
}

export default function ReportsPage() {
  const t = useTranslations("reports");
  const { user } = useSession();
  const [reports, setReports] = useState<ReportWithJoins[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportWithJoins | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    severity: [],
  });

  // Fetch initial reports
  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        const data = await getReports({
          status: filters.status.length > 0 ? filters.status : undefined,
          severity: filters.severity.length > 0 ? filters.severity : undefined,
        });
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [filters]);

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = subscribeToReports((updatedReports) => {
      setReports(updatedReports);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAcknowledge = useCallback(
    async (report: ReportWithJoins) => {
      if (!user) return;
      try {
        setIsActionLoading(true);
        await acknowledgeReport(report.id, user.id);
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  status: ReportStatus.ACKNOWLEDGED,
                  acknowledged_by: user.id,
                  acknowledged_at: new Date().toISOString(),
                }
              : r
          )
        );
        setSelectedReport((prev) =>
          prev && prev.id === report.id
            ? {
                ...prev,
                status: ReportStatus.ACKNOWLEDGED,
                acknowledged_by: user.id,
                acknowledged_at: new Date().toISOString(),
              }
            : prev
        );
      } catch (error) {
        console.error("Failed to acknowledge report:", error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [user]
  );

  const handleResolve = useCallback(
    async (report: ReportWithJoins) => {
      if (!user) return;
      try {
        setIsActionLoading(true);
        await resolveReport(report.id, user.id);
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  status: ReportStatus.RESOLVED,
                  resolved_by: user.id,
                  resolved_at: new Date().toISOString(),
                }
              : r
          )
        );
        setSelectedReport((prev) =>
          prev && prev.id === report.id
            ? {
                ...prev,
                status: ReportStatus.RESOLVED,
                resolved_by: user.id,
                resolved_at: new Date().toISOString(),
              }
            : prev
        );
      } catch (error) {
        console.error("Failed to resolve report:", error);
      } finally {
        setIsActionLoading(false);
      }
    },
    [user]
  );

  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      "Flight",
      "Unit",
      "Service Type",
      "Type",
      "Severity",
      "Status",
      "Reported By",
      "Date",
    ];

    const rows = reports.map((report) => {
      const task = report.tasks as any;
      const flight = report.flights as any;
      const reportedBy = report.users as any;
      return [
        flight?.flight_number || "—",
        task?.units?.name || "—",
        task?.service_types?.name || "—",
        report.type,
        report.severity,
        report.status,
        reportedBy?.full_name || "—",
        new Date(report.created_at).toLocaleString(),
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reports-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = getReportsColumns({
    onViewDetail: (report) => {
      setSelectedReport(report);
      setIsDetailOpen(true);
    },
    onAcknowledge: handleAcknowledge,
    onResolve: handleResolve,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        action={
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="me-2 h-4 w-4" />
            {t("export")}
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status.join(",")}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value ? (value.split(",") as ReportStatus[]) : [],
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("filterStatus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("allStatuses")}</SelectItem>
            {Object.values(ReportStatus).map((status) => (
              <SelectItem key={status} value={status}>
                <Badge variant="outline">
                  {status}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.severity.join(",")}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              severity: value ? (value.split(",") as ReportSeverity[]) : [],
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("filterSeverity")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">{t("allSeverities")}</SelectItem>
            {Object.values(ReportSeverity).map((severity) => (
              <SelectItem key={severity} value={severity}>
                <Badge variant="outline">
                  {severity}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={reports}
        isLoading={isLoading}
        searchPlaceholder={t("search")}
      />

      {/* Detail Sheet */}
      <ReportDetailSheet
        report={selectedReport}
        isOpen={isDetailOpen}
        isLoading={isActionLoading}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedReport(null);
        }}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}
