"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Plane,
  Activity,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
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
import {
  getReportSeverityColor,
  getFlightStatusColor,
} from "@/lib/utils/status-colors";
import type { FlightStatus, ReportSeverity } from "@/lib/types/database";

interface RecentFlight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  status: FlightStatus;
  scheduled_arrival: string;
}

interface OpenReport {
  id: string;
  description: string;
  severity: ReportSeverity;
  created_at: string;
}

/** Literal accent classes so the Tailwind JIT always generates them. */
const severityAccent: Record<ReportSeverity, string> = {
  low: "bg-success",
  medium: "bg-warning",
  high: "bg-secondary-200",
  critical: "bg-error",
};

export default function DashboardPage() {
  const t = useTranslations();
  const supabase = createClient();

  const [flightsToday, setFlightsToday] = useState(0);
  const [activeTasks, setActiveTasks] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [openReports, setOpenReports] = useState(0);
  const [recentFlights, setRecentFlights] = useState<RecentFlight[]>([]);
  const [reportsList, setReportsList] = useState<OpenReport[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [flights, tasks, pending, reports, recentFlightData, reportsData] =
        await Promise.all([
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
      setRecentFlights(recentFlightData as RecentFlight[]);
      setReportsList(reportsData as OpenReport[]);
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
          setReportsList(reportsData as OpenReport[]);
        }
      )
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      reportsSubscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <>
      <PageHeader
        title={t("nav.overview")}
        description={t("app.tagline")}
        icon={LayoutDashboard}
      />

      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Plane} tone="primary" label={t("overview.flightsToday")} value={flightsToday} delay={0} />
        <StatCard icon={Activity} tone="info" label={t("overview.activeTasks")} value={activeTasks} delay={0.1} />
        <StatCard icon={Clock} tone="warning" label={t("overview.pendingRequests")} value={pendingRequests} delay={0.2} />
        <StatCard icon={AlertTriangle} tone="error" label={t("overview.openReports")} value={openReports} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent flights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary-200" strokeWidth={2.5} />
                <h2 className="text-base font-extrabold text-text-primary">
                  {t("overview.recentFlights")}
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              {recentFlights.length === 0 ? (
                <p className="text-text-hint text-sm py-8 text-center">{t("common.noData")}</p>
              ) : (
                <div className="space-y-2">
                  {recentFlights.map((flight, index) => {
                    const tone = getFlightStatusColor(flight.status);
                    return (
                      <motion.div
                        key={flight.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-control border border-divider hover:bg-surface-variant transition-colors"
                      >
                        <div className="w-10 h-10 rounded-control bg-primary-200/12 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary-200">
                            {flight.airline.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-text-primary text-sm truncate">
                            {flight.flight_number} · {flight.airline}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-text-hint mt-0.5">
                            <span>{flight.origin}</span>
                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                            <span>{flight.destination}</span>
                          </div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <p className="text-sm font-semibold text-text-primary tabular-nums">
                            {new Date(flight.scheduled_arrival).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <Badge tone={tone.text} toneBg={tone.bg} dot className="mt-1">
                            {t(`flight.status.${flight.status}`)}
                          </Badge>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Open reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-error" strokeWidth={2.5} />
                <h2 className="text-base font-extrabold text-text-primary">
                  {t("overview.openReports")}
                </h2>
              </div>
            </CardHeader>
            <CardBody>
              {reportsList.length === 0 ? (
                <p className="text-text-hint text-sm py-8 text-center">{t("common.noData")}</p>
              ) : (
                <div className="space-y-2">
                  {reportsList.map((report, index) => {
                    const tone = getReportSeverityColor(report.severity);
                    return (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className="relative p-3 ps-4 rounded-control border border-divider hover:bg-surface-variant transition-colors overflow-hidden"
                      >
                        <span className={`absolute inset-y-0 start-0 w-1 ${severityAccent[report.severity]}`} />
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-sm font-medium text-text-primary flex-1 line-clamp-2">
                            {report.description}
                          </p>
                          <Badge
                            tone={tone.text}
                            toneBg={tone.bg}
                            toneBorder={tone.border}
                            className="flex-shrink-0"
                          >
                            {t(`report.severity.${report.severity}`)}
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
