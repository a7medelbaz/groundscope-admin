"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getFlightsTodayCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count, error } = await supabase
    .from("flights")
    .select("*", { count: "exact", head: true })
    .gte("scheduled_arrival", today.toISOString())
    .lt("scheduled_arrival", tomorrow.toISOString());

  if (error) {
    console.error("[Overview] Error fetching flights count:", error);
    return 0;
  }

  return count || 0;
}

export async function getActiveTasksCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress");

  if (error) {
    console.error("[Overview] Error fetching active tasks count:", error);
    return 0;
  }

  return count || 0;
}

export async function getPendingServiceRequestsCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")
    .is("unit_id", null);

  if (error) {
    console.error("[Overview] Error fetching pending requests count:", error);
    return 0;
  }

  return count || 0;
}

export async function getOpenReportsCount(): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  if (error) {
    console.error("[Overview] Error fetching open reports count:", error);
    return 0;
  }

  return count || 0;
}

export async function getRecentFlights() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("flights")
    .select(
      `
      id,
      flight_number,
      airline,
      origin,
      destination,
      status,
      scheduled_arrival,
      actual_arrival,
      aircraft_type
    `
    )
    .order("scheduled_arrival", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[Overview] Error fetching recent flights:", error);
    return [];
  }

  return data || [];
}

export async function getOpenReports() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      description,
      severity,
      created_at,
      flight_id
    `
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("[Overview] Error fetching open reports:", error);
    return [];
  }

  return data || [];
}
