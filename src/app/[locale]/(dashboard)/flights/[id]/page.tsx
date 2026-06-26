"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Info, Package, Plane } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFlightById } from "@/lib/queries/flights";
import { getFlightServiceRequests } from "@/lib/queries/service-requests";
import { getFlightStatusColor } from "@/lib/utils/status-colors";
import { cn } from "@/lib/utils/cn";
import type { Flight, FlightServiceRequest } from "@/lib/types/database";

type Tab = "info" | "services";

export default function FlightDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const flightId = params.id as string;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [services, setServices] = useState<FlightServiceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFlight();
  }, [flightId]);

  const loadFlight = async () => {
    setIsLoading(true);
    try {
      const data = await getFlightById(flightId);
      if (!data) {
        router.push(`/${locale}/flights`);
        return;
      }
      setFlight(data);
      const serviceList = await getFlightServiceRequests(data.id);
      setServices(serviceList);
    } catch (error) {
      console.error("Failed to load flight:", error);
      router.push(`/${locale}/flights`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!flight) return null;

  const tone = getFlightStatusColor(flight.status as any);

  return (
    <>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-primary-200 hover:text-primary-300 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>

      <PageHeader
        title={flight.flight_number}
        description={`${flight.airline} · ${flight.origin} → ${flight.destination}`}
        icon={Plane}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-divider">
        {[
          { id: "info" as Tab, label: "Flight Info", icon: Info },
          { id: "services" as Tab, label: "Service Requests", icon: Package },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors",
              activeTab === id
                ? "border-primary-200 text-primary-200"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            {label}
          </motion.button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} key={activeTab}>
        {/* Info Tab */}
        {activeTab === "info" && (
          <Card className="max-w-2xl">
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-hint uppercase tracking-wide mb-1">Status</p>
                  <Badge tone={tone.text} toneBg={tone.bg} toneBorder={tone.border}>
                    {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-text-hint uppercase tracking-wide mb-1">Aircraft</p>
                  <p className="font-semibold">{flight.aircraft_type || "—"}</p>
                </div>
              </div>

              <div className="border-t border-divider pt-4">
                <p className="text-xs text-text-hint uppercase tracking-wide mb-2">Scheduled Times</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">Arrival</p>
                    <p className="font-semibold">
                      {new Date(flight.scheduled_arrival).toLocaleString()}
                    </p>
                  </div>
                  {flight.actual_arrival && (
                    <div>
                      <p className="text-sm text-text-secondary">Actual Arrival</p>
                      <p className="font-semibold">{new Date(flight.actual_arrival).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {flight.stand_id && (
                <div className="border-t border-divider pt-4">
                  <p className="text-xs text-text-hint uppercase tracking-wide mb-1">Assigned Stand</p>
                  <p className="font-semibold">{flight.stand_id}</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <Card>
            <CardHeader>
              <p className="text-sm text-text-secondary">
                {services.length} request{services.length !== 1 ? "s" : ""}
              </p>
            </CardHeader>
            <CardBody>
              {services.length === 0 ? (
                <p className="text-text-hint text-center py-8">No service requests</p>
              ) : (
                <div className="space-y-3">
                  {services.map((req) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 border border-divider rounded-control hover:bg-surface-variant transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-text-primary text-sm">Service Request</p>
                          {req.notes && <p className="text-sm text-text-secondary mt-1">{req.notes}</p>}
                        </div>
                        <Badge
                          tone={req.status === "completed" ? "text-success" : "text-warning"}
                          toneBg={req.status === "completed" ? "bg-success/15" : "bg-warning/15"}
                          toneBorder={req.status === "completed" ? "border-success/30" : "border-warning/30"}
                        >
                          {req.status === "pending" ? "Pending" : req.status === "assigned" ? "Assigned" : "Completed"}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-hint mt-2">
                        {new Date(req.created_at).toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </motion.div>
    </>
  );
}
