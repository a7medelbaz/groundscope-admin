"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportWithJoins } from "@/lib/queries/reports";
import {
  getReportStatusColor,
  getReportSeverityColor,
} from "@/lib/utils/status-colors";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ReportDetailHeroProps {
  report: ReportWithJoins;
}

export function ReportDetailHero({ report }: ReportDetailHeroProps) {
  const t = useTranslations("reports");
  const flight = report.flights as any;
  const reportedBy = report.users as any;

  const statusColor = getReportStatusColor(report.status);
  const severityColor = getReportSeverityColor(report.severity);

  return (
    <Card accent="primary" className="border-primary-200/30">
      <CardBody className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-text-primary">
              {t("reportTitle")}: {flight?.flight_number || "—"}
            </h1>
            <p className="text-text-secondary mt-1">{report.type}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Badge
              tone={statusColor.text}
              toneBg={statusColor.bg}
              toneBorder={statusColor.border}
              dot
            >
              {report.status}
            </Badge>
            <Badge
              tone={severityColor.text}
              toneBg={severityColor.bg}
              toneBorder={severityColor.border}
            >
              {report.severity}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm pt-2 border-t border-divider">
          <div>
            <p className="text-text-hint font-medium">{t("reportedBy")}</p>
            <p className="text-text-primary mt-1">{reportedBy?.full_name}</p>
          </div>
          <div>
            <p className="text-text-hint font-medium">{t("columns.date")}</p>
            <p className="text-text-primary mt-1">
              {format(new Date(report.created_at), "PPp")}
            </p>
          </div>
          <div>
            <p className="text-text-hint font-medium">{t("columns.flight")}</p>
            <p className="text-text-primary mt-1">
              {flight?.flight_number || "—"}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
