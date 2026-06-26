import { createServerSupabaseClient } from "@/lib/supabase/server";
import { User, UserRole } from "@/lib/types/database";

export async function getCurrentSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", session.user.id)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data;
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> {
  const supabase = await createServerSupabaseClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("[Auth] Sign-in failed:", authError.message);
    return { user: null, error: "Invalid email or password" };
  }

  const user = await getCurrentUser();
  if (!user) {
    console.error("[Auth] User record not found for authenticated session");
    await supabase.auth.signOut();
    return { user: null, error: "User account not properly configured" };
  }

  if (user.role !== UserRole.ADMIN) {
    console.warn(`[Auth] Non-admin login attempt: ${user.role}`);
    await supabase.auth.signOut();
    return { user: null, error: "Admin access required" };
  }

  return { user, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}
