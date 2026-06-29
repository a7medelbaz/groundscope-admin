"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Stand } from "@/lib/types/database";

export async function getStands(): Promise<Stand[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("stands")
    .select("*")
    .eq("is_active", true)
    .order("code", { ascending: true });

  if (error) throw error;
  return (data || []) as Stand[];
}

export async function getStandById(id: string): Promise<Stand | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("stands")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Stand) || null;
}

export async function createStand(input: {
  code: string;
  terminal: string;
  compatible_aircraft?: string[];
  has_camera?: boolean;
}): Promise<Stand> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("stands")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as Stand;
}

export async function updateStand(
  id: string,
  input: Partial<{
    code: string;
    terminal: string;
    compatible_aircraft?: string[];
    has_camera?: boolean;
  }>
): Promise<Stand> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("stands")
    .update(input)
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single();

  if (error) throw error;
  return data as Stand;
}

export async function deleteStand(id: string): Promise<void> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("stands")
    .update({ is_active: false })
    .eq("id", id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("Stand not found or RLS prevented update");
  }
}
