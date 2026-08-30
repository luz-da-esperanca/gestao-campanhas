import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/auth/types";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  caravaneiro: {
    id: string;
    ativo: boolean;
    publicId: string;
    nome: string;
    telefone: string | null;
  } | null;
};

export const getUserById = cache(async (id: string): Promise<DbUser | null> => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      email,
      name,
      role,
      caravaneiro:caravaneiros (
        id,
        ativo,
        public_id,
        nome,
        telefone
      )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const caravaneiro = Array.isArray(data.caravaneiro)
    ? data.caravaneiro[0]
    : data.caravaneiro;

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    role: data.role as UserRole,
    caravaneiro: caravaneiro
      ? {
          id: caravaneiro.id,
          ativo: caravaneiro.ativo,
          publicId: caravaneiro.public_id,
          nome: caravaneiro.nome,
          telefone: caravaneiro.telefone,
        }
      : null,
  };
});
