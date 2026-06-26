"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getDelayAnalysis,
  getFlightTurnaroundSummary,
  getUnitPerformance,
  DelayAnalysisRow,
  FlightTurnaroundRow,
  UnitPerformanceRow,
} from "@/lib/queries/analytics";
import { getServiceTypes } from "@/lib/queries/service-types";
import { DelayAnalysisChart } from "@/components/charts/delay-analysis-chart";
import { TurnaroundSummaryTable } from "@/components/charts/turnaround-summary-table";
import { UnitPerformanceTable } from "@/components/charts/unit-performance-table";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FilterPills } from "@/components/ui/filter-pills";
import { Card, CardBody } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";
import type { ServiceType } from "@/lib/types/database";

type TabType = "delay" | "turnaround" | "performance";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [activeTab, setActiveTab] = useState<TabType>("delay");
  const [delayData, setDelayData] = useState<DelayAnalysisRow[]>([]);
  const [turnaroundData, setTurnaroundData] = useState<FlightTurnaroundRow[]>([]);
  const [performanceData, setPerformanceData] = useState<UnitPerformanceRow[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("");

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);

        // Fetch service types
        const types = await getServiceTypes();
        setServiceTypes(types);

        // Fetch analytics data based on tab
        if (activeTab === "delay" || activeTab === "turnaround") {
          const [delay, turnaround] = await Promise.all([
            getDelayAnalysis(startDate || undefined, endDate || undefined),
            getFlightTurnaroundSummary(startDate || undefined, endDate || undefined),
          ]);
          setDelayData(delay);
          setTurnaroundData(turnaround);
        } else if (activeTab === "performance") {
          const performance = await getUnitPerformance(
            selectedServiceType || undefined
          );
          setPerformanceData(performance);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [activeTab, startDate, endDate, selectedServiceType]);

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "delay", label: t("tabDelay") },
    { id: "turnaround", label: t("tabTurnaround") },
    { id: "performance", label: t("tabPerformance") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} icon={TrendingUp} />

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-divider">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === tab.id
                ? "text-primary-200"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-200"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(activeTab === "delay" || activeTab === "turnaround") && (
        <Card>
          <CardBody className="space-y-4">
            <h3 className="font-medium text-text-primary">{t("filters")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-secondary">{t("filterStartDate")}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary">{t("filterEndDate")}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-control border border-border bg-surface text-text-primary text-sm"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === "performance" && (
        <Card>
          <CardBody className="space-y-4">
            <h3 className="font-medium text-text-primary">{t("filterServiceType")}</h3>
            <FilterPills
              items={[
                { id: "", label: "All Services" },
                ...serviceTypes.map((st) => ({
                  id: st.id,
                  label: st.name,
                })),
              ]}
              selected={selectedServiceType ? [selectedServiceType] : []}
              onChange={(selected) =>
                setSelectedServiceType((selected[0] as string) || "")
              }
            />
          </CardBody>
        </Card>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <p className="text-text-secondary">{t("common.loading")}</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "delay" && <DelayAnalysisChart data={delayData} />}
            {activeTab === "turnaround" && (
              <TurnaroundSummaryTable data={turnaroundData} />
            )}
            {activeTab === "performance" && (
              <UnitPerformanceTable data={performanceData} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
