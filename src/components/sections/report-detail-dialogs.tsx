"use client";

import React from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useTranslations } from "next-intl";

interface ReportDetailDialogsProps {
  confirmAction: "acknowledge" | "resolve" | "reopen" | null;
  isLoading: boolean;
  onConfirmAcknowledge: () => void;
  onConfirmResolve: () => void;
  onConfirmReopen: () => void;
  onCancel: () => void;
}

export function ReportDetailDialogs({
  confirmAction,
  isLoading,
  onConfirmAcknowledge,
  onConfirmResolve,
  onConfirmReopen,
  onCancel,
}: ReportDetailDialogsProps) {
  const t = useTranslations("reports");

  return (
    <>
      <ConfirmDialog
        isOpen={confirmAction === "acknowledge"}
        title={t("confirmAcknowledge")}
        description={t("confirmAcknowledgeDesc")}
        confirmText={t("acknowledge")}
        cancelText={t("common.cancel")}
        isLoading={isLoading}
        onConfirm={onConfirmAcknowledge}
        onCancel={onCancel}
      />

      <ConfirmDialog
        isOpen={confirmAction === "resolve"}
        title={t("confirmResolve")}
        description={t("confirmResolveDesc")}
        confirmText={t("resolve")}
        cancelText={t("common.cancel")}
        isLoading={isLoading}
        onConfirm={onConfirmResolve}
        onCancel={onCancel}
      />

      <ConfirmDialog
        isOpen={confirmAction === "reopen"}
        title={t("confirmReopen")}
        description={t("confirmReopenDesc")}
        confirmText={t("reopen")}
        cancelText={t("common.cancel")}
        isLoading={isLoading}
        onConfirm={onConfirmReopen}
        onCancel={onCancel}
      />
    </>
  );
}
