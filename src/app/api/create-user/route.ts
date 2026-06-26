import { createClient } from "@supabase/supabase-js";

interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: "supervisor" | "unit_manager";
  service_type_id?: string;
  unit_id?: string;
}

export async function POST(request: Request) {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return Response.json(
        { error: "Missing Supabase service role key or URL" },
        { status: 500 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const body: CreateUserRequest = await request.json();

    const { error: authError, data: authData } = await (adminClient.auth.admin as any).createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      return Response.json({ error: authError.message }, { status: 400 });
    }

    const { error: dbError } = await (adminClient as any)
      .from("users")
      .insert([
        {
          auth_id: authData.user?.id,
          email: body.email,
          full_name: body.full_name,
          role: body.role,
          service_type_id: body.service_type_id || null,
          unit_id: body.unit_id || null,
          is_active: true,
        },
      ]);

    if (dbError) {
      return Response.json({ error: dbError.message }, { status: 400 });
    }

    return Response.json({ success: true, auth_id: authData.user?.id }, { status: 201 });
  } catch (error) {
    console.error("[create-user] Error:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
