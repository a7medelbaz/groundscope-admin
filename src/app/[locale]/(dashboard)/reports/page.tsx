"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getReports, ReportWithJoins } from "@/lib/queries/reports";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { FilterPills } from "@/components/ui/filter-pills";
import { useTranslations } from "next-intl";
import { getReportsColumns } from "@/components/tables/reports-columns";
import { Download, ClipboardList } from "lucide-react";
import { ReportSeverity, ReportStatus } from "@/lib/types/database";
import { subscribeToReports } from "@/lib/queries/reports-client";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithJoins[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus[]>([]);
  const [severityFilter, setSeverityFilter] = useState<ReportSeverity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports
  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        const data = await getReports({
          status: statusFilter.length > 0 ? statusFilter : undefined,
          severity: severityFilter.length > 0 ? severityFilter : undefined,
        });
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [statusFilter, severityFilter]);

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = subscribeToReports((updatedReports) => {
      setReports(updatedReports);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const exportToCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      t("columns.flight"),
      t("columns.unit"),
      t("columns.serviceType"),
      t("columns.type"),
      t("columns.severity"),
      t("columns.status"),
      t("columns.reportedBy"),
      t("columns.date"),
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
    onViewDetail: (report) => router.push(`/reports/${report.id}`),
  });

  const statusOptions = Object.values(ReportStatus).map((status) => ({
    id: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  const severityOptions = Object.values(ReportSeverity).map((severity) => ({
    id: severity,
    label: severity.charAt(0).toUpperCase() + severity.slice(1),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        icon={ClipboardList}
        action={
          <Button onClick={exportToCSV} variant="outlined" size="sm">
            <Download className="me-2 h-4 w-4" />
            {t("export")}
          </Button>
        }
      />

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t("filterStatus")}
        </label>
        <FilterPills
          items={statusOptions}
          selected={statusFilter}
          onChange={(selected) => setStatusFilter(selected as ReportStatus[])}
        />
      </div>

      {/* Severity Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          {t("filterSeverity")}
        </label>
        <FilterPills
          items={severityOptions}
          selected={severityFilter}
          onChange={(selected) => setSeverityFilter(selected as ReportSeverity[])}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={reports}
        getRowKey={(row) => row.id}
      />
    </div>
  );
}
