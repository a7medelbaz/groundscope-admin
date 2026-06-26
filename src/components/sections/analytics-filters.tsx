"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { FilterPills } from "@/components/ui/filter-pills";
import { useTranslations } from "next-intl";
import type { ServiceType } from "@/lib/types/database";

interface AnalyticsFiltersProps {
  filterType: "dateRange" | "serviceType";
  startDate?: string;
  endDate?: string;
  selectedServiceType?: string;
  serviceTypes?: ServiceType[];
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onServiceTypeChange?: (id: string) => void;
}

export function AnalyticsFilters({
  filterType,
  startDate,
  endDate,
  selectedServiceType,
  serviceTypes,
  onStartDateChange,
  onEndDateChange,
  onServiceTypeChange,
}: AnalyticsFiltersProps) {
  const t = useTranslations("analytics");

  if (filterType === "dateRange") {
    return (
      <Card>
        <CardBody className="space-y-4">
          <h3 className="font-medium text-text-primary">{t("filters")}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary">{t("filterStartDate")}</label>
              <input
                type="date"
                value={startDate || ""}
                onChange={(e) => onStartDateChange?.(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary">{t("filterEndDate")}</label>
              <input
                type="date"
                value={endDate || ""}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-sm"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <h3 className="font-medium text-text-primary">{t("filterServiceType")}</h3>
        <FilterPills
          items={[
            { id: "", label: "All Services" },
            ...(serviceTypes || []).map((st) => ({
              id: st.id,
              label: st.name,
            })),
          ]}
          selected={selectedServiceType ? [selectedServiceType] : []}
          onChange={(selected) => onServiceTypeChange?.((selected[0] as string) || "")}
        />
      </CardBody>
    </Card>
  );
}
