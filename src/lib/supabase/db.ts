import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export function getDb() {
  return createAdminClient();
}

export type AdminRow = { id: string; name: string; email: string };

export type CaravaneiroRow = {
  id: string;
  userId: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  publicId: string;
};

function mapCaravaneiro(row: {
  id: string;
  user_id: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  public_id: string;
}): CaravaneiroRow {
  return {
    id: row.id,
    userId: row.user_id,
    nome: row.nome,
    telefone: row.telefone,
    email: row.email,
    ativo: row.ativo,
    publicId: row.public_id,
  };
}

export const getDashboardStats = cache(async () => {
  const sb = getDb();
  const [
    admins,
    caravaneiros,
    ativos,
    solicitacoes,
    campanhasAtivas,
    campanhas,
    tarefas,
    doacoes,
  ] = await Promise.all([
    sb.from("users").select("*", { count: "exact", head: true }).eq("role", "admin"),
    sb.from("users").select("*", { count: "exact", head: true }).eq("role", "caravaneiro"),
    sb.from("caravaneiros").select("*", { count: "exact", head: true }).eq("ativo", true),
    sb
      .from("solicitacoes_caravaneiro")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDENTE"),
    sb.from("campanhas").select("*", { count: "exact", head: true }).eq("status", "ATIVA"),
    sb.from("campanhas").select("*", { count: "exact", head: true }),
    sb.from("tarefas").select("*", { count: "exact", head: true }),
    sb.from("arrecadacoes").select("*", { count: "exact", head: true }),
  ]);

  if (admins.error) throw admins.error;
  if (caravaneiros.error) throw caravaneiros.error;
  if (ativos.error) throw ativos.error;
  if (solicitacoes.error) throw solicitacoes.error;
  if (campanhasAtivas.error) throw campanhasAtivas.error;
  if (campanhas.error) throw campanhas.error;
  if (tarefas.error) throw tarefas.error;
  if (doacoes.error) throw doacoes.error;

  return {
    adminsCount: admins.count ?? 0,
    caravaneirosCount: caravaneiros.count ?? 0,
    ativosCount: ativos.count ?? 0,
    solicitacoesPendentesCount: solicitacoes.count ?? 0,
    campanhasAtivasCount: campanhasAtivas.count ?? 0,
    campanhasCount: campanhas.count ?? 0,
    tarefasCount: tarefas.count ?? 0,
    doacoesCount: doacoes.count ?? 0,
  };
});

export async function listAdmins(): Promise<AdminRow[]> {
  const { data, error } = await getDb()
    .from("users")
    .select("id, name, email")
    .eq("role", "admin")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listCaravaneiros(): Promise<CaravaneiroRow[]> {
  const { data: users, error: uErr } = await getDb()
    .from("users")
    .select("id")
    .eq("role", "caravaneiro");
  if (uErr) throw uErr;
  const ids = (users ?? []).map((u) => u.id);
  if (ids.length === 0) return [];

  const { data, error } = await getDb()
    .from("caravaneiros")
    .select("*")
    .in("user_id", ids)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCaravaneiro);
}

export async function getCaravaneiroById(id: string): Promise<CaravaneiroRow | null> {
  const { data, error } = await getDb()
    .from("caravaneiros")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCaravaneiro(data) : null;
}

export async function getCaravaneiroByPublicId(publicId: string) {
  const { data, error } = await getDb()
    .from("caravaneiros")
    .select("nome, ativo")
    .eq("public_id", publicId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCaravaneiroByUserId(
  userId: string,
): Promise<CaravaneiroRow | null> {
  const { data, error } = await getDb()
    .from("caravaneiros")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCaravaneiro(data) : null;
}

export async function getUserByIdSimple(id: string) {
  const { data, error } = await getDb()
    .from("users")
    .select("id, email, name, role")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
