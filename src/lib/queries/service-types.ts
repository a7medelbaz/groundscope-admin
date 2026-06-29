"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ServiceType } from "@/lib/types/database";

export async function getServiceTypes(): Promise<ServiceType[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ServiceType[];
}

export async function getServiceTypeById(id: string): Promise<ServiceType | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as ServiceType) || null;
}

export async function createServiceType(input: {
  name: string;
  description?: string;
  default_duration_minutes: number;
  icon?: string;
}): Promise<ServiceType> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("service_types")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as ServiceType;
}

export async function updateServiceType(
  id: string,
  input: Partial<{
    name: string;
    description?: string;
    default_duration_minutes: number;
    icon?: string;
  }>
): Promise<ServiceType> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("service_types")
    .update(input)
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single();

  if (error) throw error;
  return data as ServiceType;
}

export async function deleteServiceType(id: string): Promise<void> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("service_types")
    .update({ is_active: false })
    .eq("id", id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Service type not found or RLS prevented update");
  }
}
