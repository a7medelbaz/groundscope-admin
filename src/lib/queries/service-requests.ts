"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FlightServiceRequest } from "@/lib/types/database";

export async function getFlightServiceRequests(flightId: string): Promise<FlightServiceRequest[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("flight_service_requests")
    .select("*")
    .eq("flight_id", flightId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as FlightServiceRequest[];
}

export async function createServiceRequest(input: {
  flight_id: string;
  service_type_id: string;
  requested_by?: string;
  assigned_supervisor_id?: string;
  notes?: string;
}): Promise<FlightServiceRequest> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("flight_service_requests")
    .insert([{ ...input, status: "pending" }])
    .select()
    .single();

  if (error) throw error;
  return data as FlightServiceRequest;
}

export async function updateServiceRequest(
  id: string,
  input: Partial<{
    status: string;
    assigned_supervisor_id?: string;
    notes?: string;
  }>
): Promise<FlightServiceRequest> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("flight_service_requests")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as FlightServiceRequest;
}
