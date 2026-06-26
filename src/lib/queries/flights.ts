"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Flight } from "@/lib/types/database";

export async function getFlights(): Promise<Flight[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .order("scheduled_arrival", { ascending: false });

  if (error) throw error;
  return (data || []) as Flight[];
}

export async function getFlightById(id: string): Promise<Flight | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Flight) || null;
}

export async function updateFlight(
  id: string,
  input: Partial<{
    status: string;
    stand_id?: string;
    actual_arrival?: string;
    actual_departure?: string;
  }>
): Promise<Flight> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("flights")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Flight;
}
