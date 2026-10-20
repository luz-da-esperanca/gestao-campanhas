import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";
import { emailSchema } from "@/lib/auth/email";

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
  const email = emailSchema.parse(params.email);
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: params.password,
    email_confirm: true,
    user_metadata: { name: params.name },
    app_metadata: {
      role: params.role,
      active: params.active ?? true,
    },
  });

  if (error || !data.user) {
    if (error?.code === "email_exists" || error?.code === "user_already_exists") {
      throw new Error("Já existe um usuário com este e-mail.");
    }
    throw new Error(error?.message ?? "Falha ao criar usuário de autenticação");
  }

  const { error: dbError } = await supabase.from("users").insert({
    id: data.user.id,
    email,
    name: params.name,
    role: params.role,
  });

  if (dbError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw new Error(dbError.code === "23505"
      ? "Já existe um usuário com este e-mail."
      : dbError.message);
  }

  return data.user;
}
