import { getDb } from "@/lib/supabase/db";
import { listCaravaneiros } from "@/lib/supabase/db";
import { listParticipantes, type ParticipanteRow } from "@/lib/supabase/participantes";

export type PresencaMetodo = "QR" | "MANUAL";

export type PresencaRow = {
  id: string;
  campanhaId: string;
  caravaneiroId: string;
  registradoEm: string;
  metodo: PresencaMetodo;
  caravaneiroNome?: string;
};

export type ChamadaItem = ParticipanteRow & {
  presente: boolean;
  presencaEm: string | null;
  metodo: PresencaMetodo | null;
};

export async function listPresencas(campanhaId: string): Promise<PresencaRow[]> {
  const { data, error } = await getDb()
    .from("presencas")
    .select("*, caravaneiros(nome)")
    .eq("campanha_id", campanhaId)
    .order("registrado_em", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((p) => {
    const c = Array.isArray(p.caravaneiros) ? p.caravaneiros[0] : p.caravaneiros;
    return {
      id: p.id as string,
      campanhaId: p.campanha_id as string,
      caravaneiroId: p.caravaneiro_id as string,
      registradoEm: p.registrado_em as string,
      metodo: p.metodo as PresencaMetodo,
      caravaneiroNome: c?.nome,
    };
  });
}

/** Lista para chamada: participantes da campanha ou todos ativos se vazio. */
export async function getChamadaLista(campanhaId: string): Promise<ChamadaItem[]> {
  const participantes = await listParticipantes(campanhaId);
  const presencas = await listPresencas(campanhaId);
  const presMap = new Map(
    presencas.map((p) => [p.caravaneiroId, { em: p.registradoEm, metodo: p.metodo }]),
  );

  let base: ParticipanteRow[];
  if (participantes.length > 0) {
    base = participantes;
  } else {
    const todos = await listCaravaneiros();
    base = todos
      .filter((c) => c.ativo)
      .map((c) => ({
        id: c.id,
        caravaneiroId: c.id,
        nome: c.nome,
        email: c.email,
        telefone: c.telefone,
        publicId: c.publicId,
        ativo: c.ativo,
      }));
  }

  return base.map((p) => {
    const pres = presMap.get(p.caravaneiroId);
    return {
      ...p,
      presente: !!pres,
      presencaEm: pres?.em ?? null,
      metodo: pres?.metodo ?? null,
    };
  });
}

export async function marcarPresenca(input: {
  campanhaId: string;
  caravaneiroId: string;
  registradoPor: string;
  metodo: PresencaMetodo;
}) {
  const { error } = await getDb().from("presencas").upsert(
    {
      campanha_id: input.campanhaId,
      caravaneiro_id: input.caravaneiroId,
      registrado_por: input.registradoPor,
      metodo: input.metodo,
      registrado_em: new Date().toISOString(),
    },
    { onConflict: "campanha_id,caravaneiro_id" },
  );
  if (error) throw error;
}

export async function removerPresenca(campanhaId: string, caravaneiroId: string) {
  const { error } = await getDb()
    .from("presencas")
    .delete()
    .eq("campanha_id", campanhaId)
    .eq("caravaneiro_id", caravaneiroId);
  if (error) throw error;
}

export async function getCaravaneiroIdByPublicId(publicId: string): Promise<string | null> {
  const { data, error } = await getDb()
    .from("caravaneiros")
    .select("id, ativo")
    .eq("public_id", publicId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.ativo) return null;
  return data.id as string;
}

export function parsePublicIdFromQrPayload(raw: string): string | null {
  const trimmed = raw.trim();
  try {
    if (trimmed.includes("/consulta/")) {
      const match = trimmed.match(/\/consulta\/([^/?#]+)/);
      return match?.[1] ?? null;
    }
    if (/^[a-zA-Z0-9_-]{6,20}$/.test(trimmed)) return trimmed;
  } catch {
    return null;
  }
  return null;
}
