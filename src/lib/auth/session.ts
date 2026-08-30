import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/lib/data/users";
import type { SessionUser, UserRole } from "@/lib/auth/types";

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const dbUser = await getUserById(authUser.id);

  if (!dbUser) return null;

  if (
    dbUser.role === "caravaneiro" &&
    dbUser.caravaneiro &&
    !dbUser.caravaneiro.ativo
  ) {
    return null;
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
  };
});

export async function requireSessionUser(
  allowedRoles?: UserRole[],
): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Não autenticado");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Sem permissão");
  }
  return user;
}
