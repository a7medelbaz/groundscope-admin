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
import { AnalyticsTabs } from "@/components/sections/analytics-tabs";
import { AnalyticsFilters } from "@/components/sections/analytics-filters";
import { PageHeader } from "@/components/ui/page-header";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab, startDate, endDate, selectedServiceType]);

  useEffect(() => {
    getServiceTypes().then(setServiceTypes).catch(console.error);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === "delay" || activeTab === "turnaround") {
        const [delay, turnaround] = await Promise.all([
          getDelayAnalysis(startDate || undefined, endDate || undefined),
          getFlightTurnaroundSummary(startDate || undefined, endDate || undefined),
        ]);
        setDelayData(delay);
        setTurnaroundData(turnaround);
      } else {
        const performance = await getUnitPerformance(selectedServiceType || undefined);
        setPerformanceData(performance);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: "delay", label: t("tabDelay") },
    { id: "turnaround", label: t("tabTurnaround") },
    { id: "performance", label: t("tabPerformance") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} icon={TrendingUp} />
      <AnalyticsTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />

      {(activeTab === "delay" || activeTab === "turnaround") && (
        <AnalyticsFilters
          filterType="dateRange"
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      )}

      {activeTab === "performance" && (
        <AnalyticsFilters
          filterType="serviceType"
          selectedServiceType={selectedServiceType}
          serviceTypes={serviceTypes}
          onServiceTypeChange={setSelectedServiceType}
        />
      )}

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
            {activeTab === "turnaround" && <TurnaroundSummaryTable data={turnaroundData} />}
            {activeTab === "performance" && <UnitPerformanceTable data={performanceData} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
