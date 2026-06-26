"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Download, Plane } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getFlightsColumns } from "@/components/tables/flights-columns";
import { getFlights } from "@/lib/queries/flights";
import { createClient } from "@/lib/supabase/client";
import type { Flight } from "@/lib/types/database";

export default function FlightsPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    setIsLoading(true);
    try {
      const data = await getFlights();
      setFlights(data);
    } catch (error) {
      console.error("Failed to load flights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel("flights_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "flights" }, () => {
        loadFlights();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await fetch("/api/import-flights", { method: "POST" });
      if (response.ok) {
        const { imported } = await response.json();
        console.log(`Imported ${imported} flights`);
        loadFlights();
      }
    } catch (error) {
      console.error("Import failed:", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleViewClick = (row: Flight) => {
    router.push(`/${locale}/flights/${row.id}`);
  };

  const columns = getFlightsColumns({ onView: handleViewClick });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Flights"
          description="Track and manage airport flights"
          icon={Plane}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleImport}
          disabled={isImporting}
          className="flex items-center gap-2 bg-secondary-200 hover:bg-secondary-300 text-white font-bold px-4 py-2.5 rounded-control transition-all shadow-card disabled:opacity-50"
        >
          <Download className="w-5 h-5" strokeWidth={2} />
          {isImporting ? "Importing..." : "Import"}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <p className="text-sm text-text-secondary">
              {flights.length} flight{flights.length !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardBody>
            <DataTable columns={columns} data={flights} getRowKey={(row) => row.id} />
          </CardBody>
        </Card>
      </motion.div>
    </>
  );
}
