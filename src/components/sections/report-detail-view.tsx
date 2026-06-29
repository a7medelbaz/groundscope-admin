"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ReportDetailHero } from "./report-detail-hero";
import { ReportStatusBanner } from "./report-status-banner";
import { ReportDetailBody } from "./report-detail-body";
import { ReportDetailDialogs } from "./report-detail-dialogs";
import {
  ReportWithJoins,
  acknowledgeReport,
  resolveReport,
  reopenReport,
} from "@/lib/queries/reports";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ReportDetailViewProps {
  report: ReportWithJoins;
}

export function ReportDetailView({ report: initialReport }: ReportDetailViewProps) {
  const t = useTranslations("reports");
  const [report, setReport] = useState(initialReport);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "acknowledge" | "resolve" | "reopen" | null
  >(null);

  const handleAcknowledge = async () => {
    try {
      setIsLoading(true);
      const updated = await acknowledgeReport(report.id);
      setReport((prev) => ({
        ...prev,
        status: updated.status,
        acknowledged_by: updated.acknowledged_by,
        acknowledged_at: updated.acknowledged_at,
      } as ReportWithJoins));
      setConfirmAction(null);
    } catch (error) {
      console.error("Failed to acknowledge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setIsLoading(true);
      const updated = await resolveReport(report.id);
      setReport((prev) => ({
        ...prev,
        status: updated.status,
        resolved_by: updated.resolved_by,
        resolved_at: updated.resolved_at,
      } as ReportWithJoins));
      setConfirmAction(null);
    } catch (error) {
      console.error("Failed to resolve:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReopen = async () => {
    try {
      setIsLoading(true);
      await reopenReport(report.id);
      setReport((prev) => ({
        ...prev,
        status: "open" as const,
        acknowledged_by: undefined,
        acknowledged_at: undefined,
        resolved_by: undefined,
        resolved_at: undefined,
      } as ReportWithJoins));
      setConfirmAction(null);
    } catch (error) {
      console.error("Failed to reopen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-primary-200 hover:text-primary-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToReports")}
      </Link>

      <ReportDetailHero report={report} />

      <ReportStatusBanner
        report={report}
        onAcknowledge={() => setConfirmAction("acknowledge")}
        onResolve={() => setConfirmAction("resolve")}
        onReopen={() => setConfirmAction("reopen")}
        isLoading={isLoading}
      />

      <ReportDetailBody report={report} />

      <ReportDetailDialogs
        confirmAction={confirmAction}
        isLoading={isLoading}
        onConfirmAcknowledge={handleAcknowledge}
        onConfirmResolve={handleResolve}
        onConfirmReopen={handleReopen}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
