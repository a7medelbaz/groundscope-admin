"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Report, ReportStatus, ReportSeverity } from "@/lib/types/database";

export interface ReportWithJoins extends Report {
  flights?: { flight_number: string };
  tasks?: { service_types?: { name: string } };
  units?: { name: string };
  users?: { full_name: string };
  acknowledged_user?: { full_name: string };
  resolved_user?: { full_name: string };
}

interface ReportFilters {
  status?: ReportStatus[];
  severity?: ReportSeverity[];
  serviceTypeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export async function getReports(filters?: ReportFilters) {
  const supabase = (await createServerSupabaseClient()) as any;

  let query = supabase
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

  if (filters) {
    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }
    if (filters.severity && filters.severity.length > 0) {
      query = query.in("severity", filters.severity);
    }
    if (filters.serviceTypeId) {
      query = query.eq("tasks.service_type_id", filters.serviceTypeId);
    }
    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch reports:", error);
    throw error;
  }

  return (data as ReportWithJoins[]) || [];
}

export async function getReportById(id: string) {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      *,
      flights:flight_id(flight_number, airline, aircraft_type),
      tasks:task_id(service_type_id, service_types(name), units(name)),
      users:reported_by(full_name, email),
      acknowledged_user:acknowledged_by(full_name),
      resolved_user:resolved_by(full_name)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch report:", error);
    throw error;
  }

  return data as ReportWithJoins;
}

export async function acknowledgeReport(
  reportId: string,
  acknowledgedById: string
) {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: ReportStatus.ACKNOWLEDGED,
      acknowledged_by: acknowledgedById,
      acknowledged_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    console.error("Failed to acknowledge report:", error);
    throw error;
  }

  return data as Report;
}

export async function resolveReport(
  reportId: string,
  resolvedById: string
) {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: ReportStatus.RESOLVED,
      resolved_by: resolvedById,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    console.error("Failed to resolve report:", error);
    throw error;
  }

  return data as Report;
}

