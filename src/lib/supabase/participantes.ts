import { getDb } from "@/lib/supabase/db";
import type { CampanhaRow } from "@/lib/supabase/campanhas";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";

export type ParticipanteRow = {
  id: string;
  caravaneiroId: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  publicId: string;
  ativo: boolean;
};

export type CaravaneiroCampanhaRow = {
  campanha: CampanhaRow;
  presente: boolean;
  presencaEm: string | null;
};

function mapCampanha(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    nome: row.nome as string,
    tipo: row.tipo as CampanhaTipo,
    status: row.status as CampanhaStatus,
    descricao: (row.descricao as string) ?? null,
    dataInicio: (row.data_inicio as string) ?? null,
    dataFim: (row.data_fim as string) ?? null,
  };
}

export async function listParticipantes(campanhaId: string): Promise<ParticipanteRow[]> {
  const { data, error } = await getDb()
    .from("campanha_participantes")
    .select(
      "id, caravaneiro_id, caravaneiros(id, nome, email, telefone, public_id, ativo)",
    )
    .eq("campanha_id", campanhaId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const c = Array.isArray(row.caravaneiros)
      ? row.caravaneiros[0]
      : row.caravaneiros;
    return {
      id: row.id as string,
      caravaneiroId: row.caravaneiro_id as string,
      nome: c?.nome ?? "",
      email: c?.email ?? null,
      telefone: c?.telefone ?? null,
      publicId: c?.public_id ?? "",
      ativo: c?.ativo ?? false,
    };
  });
}

export async function addParticipante(campanhaId: string, caravaneiroId: string) {
  const { error } = await getDb().from("campanha_participantes").insert({
    campanha_id: campanhaId,
    caravaneiro_id: caravaneiroId,
  });
  if (error) throw error;
}

export async function removeParticipante(campanhaId: string, caravaneiroId: string) {
  const { error } = await getDb()
    .from("campanha_participantes")
    .delete()
    .eq("campanha_id", campanhaId)
    .eq("caravaneiro_id", caravaneiroId);
  if (error) throw error;
}

export async function listCampanhasDoCaravaneiro(
  caravaneiroId: string,
): Promise<CaravaneiroCampanhaRow[]> {
  const { data: links, error: lErr } = await getDb()
    .from("campanha_participantes")
    .select("campanha_id")
    .eq("caravaneiro_id", caravaneiroId);
  if (lErr) throw lErr;

  const ids = (links ?? []).map((l) => l.campanha_id as string);
  if (ids.length === 0) return [];

  const { data: campanhas, error: cErr } = await getDb()
    .from("campanhas")
    .select("*")
    .in("id", ids)
    .in("status", ["ATIVA", "ENCERRADA"])
    .order("created_at", { ascending: false });
  if (cErr) throw cErr;

  const { data: presencas, error: pErr } = await getDb()
    .from("presencas")
    .select("campanha_id, registrado_em")
    .eq("caravaneiro_id", caravaneiroId)
    .in("campanha_id", ids);
  if (pErr) throw pErr;

  const presMap = new Map(
    (presencas ?? []).map((p) => [
      p.campanha_id as string,
      p.registrado_em as string,
    ]),
  );

  return (campanhas ?? []).map((c) => ({
    campanha: mapCampanha(c),
    presente: presMap.has(c.id),
    presencaEm: presMap.get(c.id) ?? null,
  }));
}
