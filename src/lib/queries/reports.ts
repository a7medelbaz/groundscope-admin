"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Report, ReportStatus, ReportSeverity } from "@/lib/types/database";

export interface ReportWithJoins extends Report {
  flights?: {
    flight_number: string;
    airline?: string;
    aircraft_type?: string;
  } | null;
  tasks?: {
    service_type_id?: string;
    service_types?: { name: string } | null;
    units?: { name: string } | null;
  } | null;
  users?: { full_name: string; email?: string } | null;
  acknowledged_user?: { full_name: string } | null;
  resolved_user?: { full_name: string } | null;
}

interface ReportFilters {
  status?: ReportStatus[];
  severity?: ReportSeverity[];
  serviceTypeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

const LIST_SELECT = `
  *,
  flights:flight_id(flight_number, airline),
  tasks:task_id(service_type_id, service_types:service_type_id(name), units:unit_id(name)),
  users:reported_by(full_name),
  acknowledged_user:acknowledged_by(full_name),
  resolved_user:resolved_by(full_name)
`;

const DETAIL_SELECT = `
  *,
  flights:flight_id(flight_number, airline, aircraft_type),
  tasks:task_id(service_type_id, service_types:service_type_id(name), units:unit_id(name)),
  users:reported_by(full_name, email),
  acknowledged_user:acknowledged_by(full_name),
  resolved_user:resolved_by(full_name)
`;

export async function getReports(filters?: ReportFilters) {
  const supabase = (await createServerSupabaseClient()) as any;

  let query = supabase
    .from("reports")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false });

  if (filters) {
    if (filters.status && filters.status.length > 0) {
      query = query.in("status", filters.status);
    }
    if (filters.severity && filters.severity.length > 0) {
      query = query.in("severity", filters.severity);
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

  let result = (data as ReportWithJoins[]) || [];

  // service-type filter applies to the joined task; filter in memory so a
  // missing task relation doesn't drop the row before we can inspect it
  if (filters?.serviceTypeId) {
    result = result.filter(
      (r) => r.tasks?.service_type_id === filters.serviceTypeId
    );
  }

  return result;
}

export async function getReportById(id: string): Promise<ReportWithJoins | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("reports")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    console.error("Failed to fetch report:", error);
    throw error;
  }

  return data as ReportWithJoins;
}

export async function acknowledgeReport(
  reportId: string,
  acknowledgedById: string
): Promise<Report> {
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
): Promise<Report> {
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

/**
 * Reopen a resolved/acknowledged report. Returns it to `open` and clears the
 * resolution + acknowledgement trail so the workflow starts fresh.
 */
export async function reopenReport(reportId: string): Promise<Report> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: ReportStatus.OPEN,
      acknowledged_by: null,
      acknowledged_at: null,
      resolved_by: null,
      resolved_at: null,
    })
    .eq("id", reportId)
    .select()
    .single();

  if (error) {
    console.error("Failed to reopen report:", error);
    throw error;
  }

  return data as Report;
}
