"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types/database";

export async function getTasks(): Promise<Task[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Task[];
}

export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as Task) || null;
}

export async function updateTaskStatus(id: string, status: string): Promise<Task> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}
