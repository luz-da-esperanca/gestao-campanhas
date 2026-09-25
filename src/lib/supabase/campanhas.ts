import { getDb } from "@/lib/supabase/db";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";

export type CampanhaRow = {
  id: string;
  nome: string;
  tipo: CampanhaTipo;
  status: CampanhaStatus;
  descricao: string | null;
  dataInicio: string | null;
  dataFim: string | null;
  distribuicaoId: string | null;
  rotasPersonalizadas: boolean;
};

export type RotaRow = {
  id: string;
  campanhaId: string;
  nome: string;
  path: Array<{ lat: number; lng: number }>;
};

export type ItemCatalogoRow = {
  id: string;
  categoria: string;
  nome: string;
  tamanho: string | null;
};

export type ArrecadacaoRow = {
  id: string;
  campanhaId: string;
  itemId: string | null;
  descricaoOutros: string | null;
  quantidade: number;
  observacao: string | null;
  itemNome?: string;
  itemTamanho?: string | null;
};

function mapCampanha(row: Record<string, unknown>): CampanhaRow {
  return {
    id: row.id as string,
    nome: row.nome as string,
    tipo: row.tipo as CampanhaTipo,
    status: row.status as CampanhaStatus,
    descricao: (row.descricao as string) ?? null,
    dataInicio: (row.data_inicio as string) ?? null,
    dataFim: (row.data_fim as string) ?? null,
    distribuicaoId: (row.distribuicao_id as string) ?? null,
    rotasPersonalizadas: row.rotas_personalizadas === true,
  };
}

/** Campanhas visíveis ao público (sem login). */
export async function listCampanhasPublicas(): Promise<CampanhaRow[]> {
  const { data, error } = await getDb()
    .from("campanhas")
    .select("*")
    .in("status", ["ATIVA", "ENCERRADA"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCampanha);
}

export async function listCampanhas(): Promise<CampanhaRow[]> {
  const { data, error } = await getDb()
    .from("campanhas")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCampanha);
}

export async function getCampanha(id: string): Promise<CampanhaRow | null> {
  const { data, error } = await getDb()
    .from("campanhas")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCampanha(data) : null;
}

export async function createCampanha(input: {
  nome: string;
  tipo: CampanhaTipo;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  distribuicaoId?: string;
}) {
  const { data, error } = await getDb()
    .from("campanhas")
    .insert({
      nome: input.nome,
      tipo: input.tipo,
      descricao: input.descricao ?? null,
      data_inicio: input.dataInicio ?? null,
      data_fim: input.dataFim ?? null,
      status: "PLANEJADA",
      ...(input.distribuicaoId ? { distribuicao_id: input.distribuicaoId } : {}),
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapCampanha(data);
}

export async function updateCampanhaStatus(id: string, status: CampanhaStatus) {
  const { error } = await getDb()
    .from("campanhas")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function listRotasByCampanha(campanhaId: string): Promise<RotaRow[]> {
  const campanha = await getCampanha(campanhaId);
  if (!campanha) return [];
  const origemId = campanha.distribuicaoId && !campanha.rotasPersonalizadas
    ? campanha.distribuicaoId : campanhaId;
  const { data, error } = await getDb()
    .from("rotas")
    .select("*")
    .eq("campanha_id", origemId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    campanhaId: r.campanha_id,
    nome: r.nome,
    path: (r.path as Array<{ lat: number; lng: number }>) ?? [],
  }));
}

export async function saveRota(input: {
  campanhaId: string;
  nome: string;
  path: Array<{ lat: number; lng: number }>;
}) {
  const { data, error } = await getDb()
    .from("rotas")
    .insert({
      campanha_id: input.campanhaId,
      nome: input.nome,
      path: input.path,
    })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id,
    campanhaId: data.campanha_id,
    nome: data.nome,
    path: data.path as Array<{ lat: number; lng: number }>,
  };
}

export async function deleteRota(id: string, campanhaId: string) {
  const { data, error } = await getDb().from("rotas").delete()
    .eq("id", id).eq("campanha_id", campanhaId).select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("Rota não pertence a esta campanha");
}

export async function personalizarRotasColeta(campanhaId: string) {
  const { error } = await getDb().rpc("personalizar_rotas_coleta", { p_campanha_id: campanhaId });
  if (error) throw error;
}

export async function listItemCatalogo(): Promise<ItemCatalogoRow[]> {
  const { data, error } = await getDb()
    .from("item_catalogo")
    .select("*")
    .eq("ativo", true)
    .order("categoria")
    .order("nome");
  if (error) throw error;
  return (data ?? []).map((i) => ({
    id: i.id,
    categoria: i.categoria,
    nome: i.nome,
    tamanho: i.tamanho,
  }));
}

export async function listArrecadacoes(campanhaId: string): Promise<ArrecadacaoRow[]> {
  const { data, error } = await getDb()
    .from("arrecadacoes")
    .select("*, item_catalogo(nome, tamanho)")
    .eq("campanha_id", campanhaId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((a) => {
    const item = Array.isArray(a.item_catalogo)
      ? a.item_catalogo[0]
      : a.item_catalogo;
    return {
      id: a.id,
      campanhaId: a.campanha_id,
      itemId: a.item_id,
      descricaoOutros: a.descricao_outros,
      quantidade: a.quantidade,
      observacao: a.observacao,
      itemNome: item?.nome,
      itemTamanho: item?.tamanho,
    };
  });
}

export async function createArrecadacao(input: {
  campanhaId: string;
  itemId?: string;
  descricaoOutros?: string;
  quantidade: number;
  observacao?: string;
  registradoPor: string;
}) {
  const { error } = await getDb().from("arrecadacoes").insert({
    campanha_id: input.campanhaId,
    item_id: input.itemId ?? null,
    descricao_outros: input.descricaoOutros ?? null,
    quantidade: input.quantidade,
    observacao: input.observacao ?? null,
    registrado_por: input.registradoPor,
  });
  if (error) throw error;
}

export async function getArrecadacaoResumo(campanhaId: string) {
  const rows = await listArrecadacoes(campanhaId);
  const map = new Map<string, number>();
  for (const r of rows) {
    const label = r.itemId
      ? `${r.itemNome}${r.itemTamanho ? ` (${r.itemTamanho})` : ""}`
      : r.descricaoOutros ?? "Outros";
    map.set(label, (map.get(label) ?? 0) + r.quantidade);
  }
  return Array.from(map.entries()).map(([label, total]) => ({ label, total }));
}
