"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlideOverSheet } from "@/components/ui/slide-over-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReportWithJoins } from "@/lib/queries/reports";
import { getReportStatusColor, getReportSeverityColor } from "@/lib/utils/status-colors";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ReportDetailSheetProps {
  report: ReportWithJoins | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onAcknowledge: (report: ReportWithJoins) => Promise<void>;
  onResolve: (report: ReportWithJoins) => Promise<void>;
}

export function ReportDetailSheet({
  report,
  isOpen,
  isLoading,
  onClose,
  onAcknowledge,
  onResolve,
}: ReportDetailSheetProps) {
  const t = useTranslations("reports");
  const [confirmAction, setConfirmAction] = useState<"acknowledge" | "resolve" | null>(null);

  if (!report) return null;

  const handleAcknowledge = async () => {
    await onAcknowledge(report);
    setConfirmAction(null);
  };

  const handleResolve = async () => {
    await onResolve(report);
    setConfirmAction(null);
  };

  const flight = report.flights as any;
  const task = report.tasks as any;
  const reportedBy = report.users as any;
  const acknowledgedBy = report.acknowledged_user as any;
  const resolvedBy = report.resolved_user as any;

  return (
    <>
      <SlideOverSheet
        isOpen={isOpen}
        onClose={onClose}
        title={`${t("detail")} — ${flight?.flight_number || "—"}`}
      >
        <div className="space-y-6">
          {/* Status and Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("columns.status")}
              </label>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={getReportStatusColor(report.status)}
                >
                  {report.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("columns.severity")}
              </label>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={getReportSeverityColor(report.severity)}
                >
                  {report.severity}
                </Badge>
              </div>
            </div>
          </div>

          {/* Type and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("columns.type")}
              </label>
              <p className="mt-2 text-sm">{report.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("columns.date")}
              </label>
              <p className="mt-2 text-sm">
                {format(new Date(report.created_at), "PPpp")}
              </p>
            </div>
          </div>

          {/* Flight and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("columns.flight")}
              </label>
              <p className="mt-2 text-sm">{flight?.flight_number || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("columns.unit")}
              </label>
              <p className="mt-2 text-sm">{task?.units?.name || "—"}</p>
            </div>
          </div>

          {/* Service Type */}
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("columns.serviceType")}
            </label>
            <p className="mt-2 text-sm">{task?.service_types?.name || "—"}</p>
          </div>

          {/* Reported By */}
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("columns.reportedBy")}
            </label>
            <p className="mt-2 text-sm">{reportedBy?.full_name || "—"}</p>
          </div>

          {/* Photo */}
          {report.image_url && (
            <div>
              <label className="text-sm font-medium text-text-secondary">
                {t("photo")}
              </label>
              <div className="mt-2 overflow-hidden rounded-lg border border-border">
                <img
                  src={report.image_url}
                  alt="Report photo"
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-text-secondary">
              {t("description")}
            </label>
            <p className="mt-2 whitespace-pre-wrap rounded-lg bg-background-secondary p-3 text-sm">
              {report.description}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3 border-t border-border pt-6">
            <h3 className="font-medium">{t("timeline")}</h3>

            {/* Reported */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-info" />
                <div className="mt-3 h-8 w-px bg-border" />
              </div>
              <div>
                <p className="text-sm font-medium">{t("timelineReported")}</p>
                <p className="text-xs text-text-secondary">
                  {format(new Date(report.created_at), "PPp")}
                </p>
                <p className="text-xs text-text-hint">{reportedBy?.full_name}</p>
              </div>
            </div>

            {/* Acknowledged */}
            {report.acknowledged_at && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary-200" />
                  <div className="mt-3 h-8 w-px bg-border" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("timelineAcknowledged")}</p>
                  <p className="text-xs text-text-secondary">
                    {format(new Date(report.acknowledged_at), "PPp")}
                  </p>
                  <p className="text-xs text-text-hint">{acknowledgedBy?.full_name}</p>
                </div>
              </div>
            )}

            {/* Resolved */}
            {report.resolved_at && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t("timelineResolved")}</p>
                  <p className="text-xs text-text-secondary">
                    {format(new Date(report.resolved_at), "PPp")}
                  </p>
                  <p className="text-xs text-text-hint">{resolvedBy?.full_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-border pt-6">
            {report.status === "open" && (
              <Button
                variant="outline"
                onClick={() => setConfirmAction("acknowledge")}
                disabled={isLoading}
              >
                {t("acknowledge")}
              </Button>
            )}
            {report.status !== "resolved" && (
              <Button
                onClick={() => setConfirmAction("resolve")}
                disabled={isLoading}
              >
                {t("resolve")}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="ml-auto"
            >
              {t("close")}
            </Button>
          </div>
        </div>
      </SlideOverSheet>

      <ConfirmDialog
        isOpen={confirmAction === "acknowledge"}
        title={t("confirmAcknowledge")}
        description={t("confirmAcknowledgeDesc")}
        onConfirm={handleAcknowledge}
        onCancel={() => setConfirmAction(null)}
        isLoading={isLoading}
      />

      <ConfirmDialog
        isOpen={confirmAction === "resolve"}
        title={t("confirmResolve")}
        description={t("confirmResolveDesc")}
        onConfirm={handleResolve}
        onCancel={() => setConfirmAction(null)}
        isLoading={isLoading}
      />
    </>
  );
}
