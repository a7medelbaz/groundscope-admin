"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  getFlightsTodayCount,
  getActiveTasksCount,
  getPendingServiceRequestsCount,
  getOpenReportsCount,
  getRecentFlights,
  getOpenReports,
} from "@/lib/queries/overview";
import { getReportSeverityColor } from "@/lib/utils/status-colors";

export default function DashboardPage() {
  const t = useTranslations();
  const supabase = createClient();

  const [flightsToday, setFlightsToday] = useState(0);
  const [activeTasks, setActiveTasks] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [openReports, setOpenReports] = useState(0);
  const [recentFlights, setRecentFlights] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [flights, tasks, pending, reports, recentFlightData, reportsData] = await Promise.all([
        getFlightsTodayCount(),
        getActiveTasksCount(),
        getPendingServiceRequestsCount(),
        getOpenReportsCount(),
        getRecentFlights(),
        getOpenReports(),
      ]);

      setFlightsToday(flights);
      setActiveTasks(tasks);
      setPendingRequests(pending);
      setOpenReports(reports);
      setRecentFlights(recentFlightData);
      setReportsList(reportsData);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const tasksSubscription = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        async () => {
          const [tasks, pending] = await Promise.all([
            getActiveTasksCount(),
            getPendingServiceRequestsCount(),
          ]);
          setActiveTasks(tasks);
          setPendingRequests(pending);
        }
      )
      .subscribe();

    const reportsSubscription = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        async () => {
          const [reports, reportsData] = await Promise.all([
            getOpenReportsCount(),
            getOpenReports(),
          ]);
          setOpenReports(reports);
          setReportsList(reportsData);
        }
      )
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      reportsSubscription.unsubscribe();
    };
  }, [supabase]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <>
      <PageHeader
        title={t("nav.overview")}
        description={t("app.tagline")}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          icon="✈️"
          label={t("overview.flightsToday")}
          value={flightsToday}
          delay={0}
        />
        <StatCard
          icon="⚙️"
          label={t("overview.activeTasks")}
          value={activeTasks}
          delay={0.1}
        />
        <StatCard
          icon="📋"
          label={t("overview.pendingRequests")}
          value={pendingRequests}
          delay={0.2}
        />
        <StatCard
          icon="⚠️"
          label={t("overview.openReports")}
          value={openReports}
          delay={0.3}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary">
                {t("overview.recentFlights")}
              </h2>
            </CardHeader>
            <CardBody>
              {recentFlights.length === 0 ? (
                <p className="text-text-hint text-sm">{t("common.noData")}</p>
              ) : (
                <div className="space-y-3">
                  {recentFlights.map((flight, index) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-divider hover:bg-surface-variant transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary">
                          {flight.flight_number} • {flight.airline}
                        </p>
                        <p className="text-sm text-text-hint">
                          {flight.origin} → {flight.destination}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-text-primary">
                          {new Date(flight.scheduled_arrival).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <Badge variant={flight.status === "arrived" ? "success" : "info"}>
                          {flight.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-text-primary">
                {t("overview.openReports")}
              </h2>
            </CardHeader>
            <CardBody>
              {reportsList.length === 0 ? (
                <p className="text-text-hint text-sm">{t("common.noData")}</p>
              ) : (
                <div className="space-y-3">
                  {reportsList.map((report, index) => {
                    const severityColor = getReportSeverityColor(report.severity);
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 rounded-lg border border-divider hover:bg-surface-variant transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium text-text-primary flex-1 line-clamp-2">
                            {report.description}
                          </p>
                          <Badge
                            variant="default"
                            className={`flex-shrink-0 ${severityColor.bg} ${severityColor.text}`}
                          >
                            {report.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-hint">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
