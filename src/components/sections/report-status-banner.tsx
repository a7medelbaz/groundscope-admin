"use client";

import React from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReportWithJoins } from "@/lib/queries/reports";
import { ReportStatus } from "@/lib/types/database";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface ReportStatusBannerProps {
  report: ReportWithJoins;
  onAcknowledge: () => void;
  onResolve: () => void;
  onReopen: () => void;
  isLoading: boolean;
}

export function ReportStatusBanner({
  report,
  onAcknowledge,
  onResolve,
  onReopen,
  isLoading,
}: ReportStatusBannerProps) {
  const t = useTranslations("reports");
  const acknowledgedBy = report.acknowledged_user as any;
  const resolvedBy = report.resolved_user as any;

  if (report.status === ReportStatus.OPEN) {
    return (
      <Card accent="warning" className="border-warning/30">
        <div className="px-6 py-4 flex items-start gap-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex-shrink-0"
          >
            <AlertCircle className="w-6 h-6 text-warning" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">
              {t("bannerOpenTitle")}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {t("bannerOpenDesc")}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outlined"
              size="sm"
              onClick={onAcknowledge}
              disabled={isLoading}
            >
              {t("acknowledge")}
            </Button>
            <Button
              size="sm"
              onClick={onResolve}
              disabled={isLoading}
            >
              {t("resolve")}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (report.status === ReportStatus.ACKNOWLEDGED) {
    return (
      <Card accent="info" className="border-info/30">
        <div className="px-6 py-4 flex items-start gap-4">
          <Clock className="w-6 h-6 text-info flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">
              {t("bannerAckTitle")}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {t("bannerAckDesc")}{" "}
              <span className="font-medium">
                {acknowledgedBy?.full_name}
              </span>{" "}
              {report.acknowledged_at && (
                <>
                  {t("on")}{" "}
                  <span className="font-medium">
                    {format(new Date(report.acknowledged_at), "PPp")}
                  </span>
                </>
              )}
            </p>
          </div>
          <Button
            size="sm"
            onClick={onResolve}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            {t("resolve")}
          </Button>
        </div>
      </Card>
    );
  }

  if (report.status === ReportStatus.RESOLVED) {
    return (
      <Card accent="success" className="border-success/30">
        <div className="px-6 py-4 flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">
              {t("bannerResolvedTitle")}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {t("bannerResolvedDesc")}{" "}
              <span className="font-medium">
                {resolvedBy?.full_name}
              </span>{" "}
              {report.resolved_at && (
                <>
                  {t("on")}{" "}
                  <span className="font-medium">
                    {format(new Date(report.resolved_at), "PPp")}
                  </span>
                </>
              )}
            </p>
          </div>
          <Button
            variant="outlined"
            size="sm"
            onClick={onReopen}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            {t("reopen")}
          </Button>
        </div>
      </Card>
    );
  }

  return null;
}
