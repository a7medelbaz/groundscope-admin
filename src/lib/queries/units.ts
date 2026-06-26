"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Unit } from "@/lib/types/database";

export async function getUnits(): Promise<Unit[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []) as Unit[];
}

export async function getUnitById(id: string): Promise<Unit | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Unit) || null;
}

export async function createUnit(input: {
  name: string;
  service_type_id: string;
  status?: string;
  compatible_aircraft?: string[];
  shift_start_time?: string;
  shift_end_time?: string;
}): Promise<Unit> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("units")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as Unit;
}

export async function updateUnit(
  id: string,
  input: Partial<{
    name: string;
    service_type_id: string;
    status: string;
    compatible_aircraft?: string[];
    shift_start_time?: string;
    shift_end_time?: string;
  }>
): Promise<Unit> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("units")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Unit;
}

export async function deleteUnit(id: string): Promise<void> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { error } = await supabase.from("units").delete().eq("id", id);

  if (error) throw error;
}
