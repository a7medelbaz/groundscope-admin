"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@/lib/types/database";

export async function getUsers(): Promise<User[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as User) || null;
}

export async function updateUser(
  id: string,
  input: Partial<{
    full_name: string;
    phone?: string;
    fcm_token?: string;
  }>
): Promise<User> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("users")
    .update(input)
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function deleteUser(id: string): Promise<void> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("users")
    .update({ is_active: false })
    .eq("id", id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("User not found or RLS prevented update");
  }
}

export async function createUserViaBrowser(
  email: string,
  password: string,
  full_name: string,
  role: "supervisor" | "unit_manager",
  service_type_id?: string,
  unit_id?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        full_name,
        role,
        service_type_id,
        unit_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Network error" };
  }
}
