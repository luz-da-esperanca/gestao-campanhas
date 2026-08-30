import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";

export async function syncUserMetadata(
  userId: string,
  role: UserRole,
  active = true,
) {
  const supabase = createAdminClient();
  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role, active },
  });
}

export async function createAuthUser(params: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  active?: boolean;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: true,
    user_metadata: { name: params.name },
    app_metadata: {
      role: params.role,
      active: params.active ?? true,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Falha ao criar usuário de autenticação");
  }

  const { error: dbError } = await supabase.from("users").insert({
    id: data.user.id,
    email: params.email,
    name: params.name,
    role: params.role,
  });

  if (dbError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(dbError.message);
  }

  return data.user;
}
