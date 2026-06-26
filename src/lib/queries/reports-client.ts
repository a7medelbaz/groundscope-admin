"use client";

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { ReportWithJoins } from "./reports";

export function subscribeToReports(callback: (reports: ReportWithJoins[]) => void) {
  const supabase = createBrowserClient();

  const subscription = supabase
    .channel("reports-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "reports",
      },
      async (payload) => {
        const { data } = await supabase
          .from("reports")
          .select(
            `
            *,
            flights:flight_id(flight_number),
            tasks:task_id(service_type_id, service_types(name)),
            units:tasks(unit_id, units(name)),
            users:reported_by(full_name),
            acknowledged_user:acknowledged_by(full_name),
            resolved_user:resolved_by(full_name)
          `
          )
          .order("created_at", { ascending: false });

        if (data) {
          callback(data as ReportWithJoins[]);
        }
      }
    )
    .subscribe();

  return subscription;
}
