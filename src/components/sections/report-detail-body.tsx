"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { ReportWithJoins } from "@/lib/queries/reports";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

interface ReportDetailBodyProps {
  report: ReportWithJoins;
}

export function ReportDetailBody({ report }: ReportDetailBodyProps) {
  const t = useTranslations("reports");
  const task = report.tasks as any;
  const reportedBy = report.users as any;
  const acknowledgedBy = report.acknowledged_user as any;
  const resolvedBy = report.resolved_user as any;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Description + Photo */}
      <div className="col-span-2 space-y-6">
        {/* Description */}
        <Card>
          <CardBody className="space-y-3">
            <h2 className="font-semibold text-text-primary">
              {t("description")}
            </h2>
            <p className="whitespace-pre-wrap text-text-secondary text-sm leading-relaxed">
              {report.description}
            </p>
          </CardBody>
        </Card>

        {/* Photo */}
        {report.image_url && (
          <Card>
            <CardBody>
              <h2 className="font-semibold text-text-primary mb-3">
                {t("photo")}
              </h2>
              <img
                src={report.image_url}
                alt="Report attachment"
                className="w-full rounded-control max-h-96 object-cover"
              />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Right: Metadata + Timeline */}
      <div className="space-y-6">
        {/* Metadata Card */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-text-primary">
              {t("details")}
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-hint font-medium">
                  {t("columns.unit")}
                </p>
                <p className="text-text-primary mt-1">
                  {task?.units?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-text-hint font-medium">
                  {t("columns.serviceType")}
                </p>
                <p className="text-text-primary mt-1">
                  {task?.service_types?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-text-hint font-medium">
                  {t("columns.reportedBy")}
                </p>
                <p className="text-text-primary mt-1">
                  {reportedBy?.email || reportedBy?.full_name || "—"}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Timeline */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="font-semibold text-text-primary">
              {t("timeline")}
            </h2>

            <div className="space-y-3">
              {/* Reported */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-text-primary" />
                  {report.acknowledged_at && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-text-primary">
                    {t("timelineReported")}
                  </p>
                  <p className="text-xs text-text-hint mt-1">
                    {format(new Date(report.created_at), "PPp")}
                  </p>
                </div>
              </div>

              {/* Acknowledged */}
              {report.acknowledged_at && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-info" />
                    {report.resolved_at && (
                      <div className="w-0.5 h-8 bg-border" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-text-primary">
                      {t("timelineAcknowledged")}
                    </p>
                    <p className="text-xs text-text-hint mt-1">
                      {format(new Date(report.acknowledged_at), "PPp")}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {acknowledgedBy?.full_name}
                    </p>
                  </div>
                </div>
              )}

              {/* Resolved */}
              {report.resolved_at && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-text-primary">
                      {t("timelineResolved")}
                    </p>
                    <p className="text-xs text-text-hint mt-1">
                      {format(new Date(report.resolved_at), "PPp")}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {resolvedBy?.full_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
