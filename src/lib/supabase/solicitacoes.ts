import { getDb } from "@/lib/supabase/db";

export type SolicitacaoStatus = "PENDENTE" | "APROVADA" | "RECUSADA";

export type SolicitacaoRow = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  mensagem: string | null;
  status: SolicitacaoStatus;
  createdAt: string;
};

export async function listSolicitacoesPendentes(): Promise<SolicitacaoRow[]> {
  const { data, error } = await getDb()
    .from("solicitacoes_caravaneiro")
    .select("*")
    .eq("status", "PENDENTE")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSolicitacao);
}

export async function countSolicitacoesPendentes(): Promise<number> {
  const { count, error } = await getDb()
    .from("solicitacoes_caravaneiro")
    .select("*", { count: "exact", head: true })
    .eq("status", "PENDENTE");
  if (error) throw error;
  return count ?? 0;
}

export async function getSolicitacao(id: string): Promise<SolicitacaoRow | null> {
  const { data, error } = await getDb()
    .from("solicitacoes_caravaneiro")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSolicitacao(data) : null;
}

export async function createSolicitacao(input: {
  nome: string;
  email: string;
  telefone?: string;
  mensagem?: string;
}) {
  const { error } = await getDb().from("solicitacoes_caravaneiro").insert({
    nome: input.nome,
    email: input.email,
    telefone: input.telefone ?? null,
    mensagem: input.mensagem ?? null,
    status: "PENDENTE",
  });
  if (error) throw error;
}

export async function updateSolicitacaoStatus(
  id: string,
  status: SolicitacaoStatus,
) {
  const { error } = await getDb()
    .from("solicitacoes_caravaneiro")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

function mapSolicitacao(row: Record<string, unknown>): SolicitacaoRow {
  return {
    id: row.id as string,
    nome: row.nome as string,
    email: row.email as string,
    telefone: (row.telefone as string) ?? null,
    mensagem: (row.mensagem as string) ?? null,
    status: row.status as SolicitacaoStatus,
    createdAt: row.created_at as string,
  };
}
