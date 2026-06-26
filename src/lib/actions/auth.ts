"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/database";
import { getCurrentUser } from "@/lib/queries/auth";

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createServerSupabaseClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("[Auth] Sign-in failed:", authError.message);
    return { success: false, error: "Invalid email or password" };
  }

  const user = await getCurrentUser();
  if (!user) {
    console.error("[Auth] User record not found for authenticated session");
    await supabase.auth.signOut();
    return { success: false, error: "User account not properly configured" };
  }

  if (user.role !== UserRole.ADMIN) {
    console.warn(`[Auth] Non-admin login attempt: ${user.role}`);
    await supabase.auth.signOut();
    return { success: false, error: "Admin access required" };
  }

  return { success: true, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}
