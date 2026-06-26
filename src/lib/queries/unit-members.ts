"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UnitMember } from "@/lib/types/database";

export async function getUnitMembers(unitId: string): Promise<UnitMember[]> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("unit_members")
    .select("*")
    .eq("unit_id", unitId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as UnitMember[];
}

export async function getUnitMemberById(id: string): Promise<UnitMember | null> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("unit_members")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as UnitMember) || null;
}

export async function createUnitMember(input: {
  unit_id: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  position: string;
  image_url?: string;
}): Promise<UnitMember> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("unit_members")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as UnitMember;
}

export async function updateUnitMember(
  id: string,
  input: Partial<{
    full_name: string;
    phone?: string;
    national_id?: string;
    position: string;
    image_url?: string;
  }>
): Promise<UnitMember> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { data, error } = await supabase
    .from("unit_members")
    .update(input)
    .eq("id", id)
    .eq("is_active", true)
    .select()
    .single();

  if (error) throw error;
  return data as UnitMember;
}

export async function deleteUnitMember(id: string): Promise<void> {
  const supabase = (await createServerSupabaseClient()) as any;

  const { error } = await supabase
    .from("unit_members")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

export async function uploadMemberPhoto(
  unitId: string,
  memberId: string,
  file: File
): Promise<string> {
  const supabase = (await createServerSupabaseClient()) as any;
  const ext = file.name.split(".").pop();
  const filename = `${memberId}.${ext}`;
  const path = `unit-members/${unitId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("unit-members")
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("unit-members").getPublicUrl(path);
  return data.publicUrl;
}
