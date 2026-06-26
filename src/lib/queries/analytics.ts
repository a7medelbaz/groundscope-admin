"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface DelayAnalysisRow {
  id: string;
  service_type_id: string;
  service_types?: { name: string } | null;
  start_delay_minutes?: number;
  end_delay_minutes?: number;
  scheduled_end?: string;
  actual_end?: string;
  flight_id: string;
  task_id: string;
}

export interface FlightTurnaroundRow {
  id: string;
  flight_number: string;
  scheduled_arrival?: string;
  actual_arrival?: string;
  scheduled_departure?: string;
  actual_departure?: string;
  turnaround_minutes?: number;
  total_tasks?: number;
  completed_tasks?: number;
  had_delays?: boolean;
  had_reports?: boolean;
}

export interface UnitPerformanceRow {
  unit_id: string;
  unit_name: string;
  tasks_assigned: number;
  tasks_completed: number;
  tasks_cancelled: number;
  avg_start_delay_minutes?: number;
  avg_duration_minutes?: number;
}

/**
 * Fetch delay analysis data — avg start delay per service type, and worst-delayed tasks.
 * Respects date range filter.
 */
export async function getDelayAnalysis(
  startDate?: string,
  endDate?: string
): Promise<DelayAnalysisRow[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  let query = supabase
    .from("delay_analysis")
    .select(
      `
      id,
      service_type_id,
      service_types:service_type_id(name),
      start_delay_minutes,
      end_delay_minutes,
      scheduled_end,
      actual_end,
      flight_id,
      task_id
    `
    )
    .order("start_delay_minutes", { ascending: false });

  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch delay analysis:", error);
    throw error;
  }

  return (data as DelayAnalysisRow[]) || [];
}

/**
 * Fetch flight turnaround summary — turnaround time, tasks completed, delays/reports.
 * Respects date range filter.
 */
export async function getFlightTurnaroundSummary(
  startDate?: string,
  endDate?: string
): Promise<FlightTurnaroundRow[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  let query = supabase
    .from("flight_turnaround_summary")
    .select("*")
    .order("scheduled_arrival", { ascending: false });

  if (startDate) {
    query = query.gte("scheduled_arrival", startDate);
  }
  if (endDate) {
    query = query.lte("scheduled_arrival", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch turnaround summary:", error);
    throw error;
  }

  return (data as FlightTurnaroundRow[]) || [];
}

/**
 * Fetch unit performance metrics — tasks assigned/completed/cancelled, delays.
 * Optionally filter by service type.
 */
export async function getUnitPerformance(
  serviceTypeId?: string
): Promise<UnitPerformanceRow[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  // Fetch all tasks and units to compute metrics
  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select(`
      id,
      unit_id,
      service_type_id,
      status,
      units:unit_id(name)
    `);

  if (tasksError) {
    console.error("Failed to fetch tasks:", tasksError);
    throw tasksError;
  }

  // Fetch delay analysis for average delays
  const { data: delayData, error: delayError } = await supabase
    .from("delay_analysis")
    .select(`
      task_id,
      start_delay_minutes,
      scheduled_end,
      actual_end
    `);

  if (delayError) {
    console.error("Failed to fetch delay analysis:", delayError);
    throw delayError;
  }

  // Compute performance metrics in memory
  const performanceMap = new Map<string, UnitPerformanceRow>();

  (tasksData || []).forEach((task: any) => {
    if (
      serviceTypeId &&
      task.service_type_id !== serviceTypeId
    ) {
      return; // Skip if filtering by service type
    }

    const unitId = task.unit_id || "unassigned";
    const unitName = task.units?.name || "Unassigned";

    if (!performanceMap.has(unitId)) {
      performanceMap.set(unitId, {
        unit_id: unitId,
        unit_name: unitName,
        tasks_assigned: 0,
        tasks_completed: 0,
        tasks_cancelled: 0,
        avg_start_delay_minutes: 0,
      });
    }

    const perf = performanceMap.get(unitId)!;
    perf.tasks_assigned += 1;

    if (task.status === "completed") {
      perf.tasks_completed += 1;
    } else if (task.status === "cancelled") {
      perf.tasks_cancelled += 1;
    }

    // Find corresponding delay entry
    const delay = (delayData || []).find(
      (d: any) => d.task_id === task.id
    );
    if (delay?.start_delay_minutes) {
      perf.avg_start_delay_minutes = (perf.avg_start_delay_minutes || 0) + delay.start_delay_minutes;
    }

    // Calculate duration if actual_end exists
    if (delay?.actual_end && delay?.scheduled_end) {
      const scheduled = new Date(delay.scheduled_end).getTime();
      const actual = new Date(delay.actual_end).getTime();
      const durationMs = actual - scheduled;
      const durationMinutes = Math.floor(durationMs / 60000);
      if (durationMinutes > 0) {
        perf.avg_duration_minutes = (perf.avg_duration_minutes || 0) + durationMinutes;
      }
    }
  });

  // Finalize averages
  const result: UnitPerformanceRow[] = [];
  performanceMap.forEach((perf) => {
    if (perf.tasks_assigned > 0) {
      perf.avg_start_delay_minutes = Math.round(perf.avg_start_delay_minutes / perf.tasks_assigned);
      perf.avg_duration_minutes = Math.round(perf.avg_duration_minutes / perf.tasks_assigned);
    }
    result.push(perf);
  });

  return result.sort((a, b) => b.tasks_assigned - a.tasks_assigned);
}
