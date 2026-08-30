"use server";

import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/lib/auth/session";
import {
  addParticipante,
  removeParticipante,
} from "@/lib/supabase/participantes";
import {
  marcarPresenca,
  removerPresenca,
  getCaravaneiroIdByPublicId,
  parsePublicIdFromQrPayload,
} from "@/lib/supabase/presencas";
import { getCampanha } from "@/lib/supabase/campanhas";

export async function addParticipanteAction(
  campanhaId: string,
  caravaneiroId: string,
) {
  await requireSessionUser(["admin"]);
  try {
    await addParticipante(campanhaId, caravaneiroId);
    revalidatePath(`/admin/campanhas/${campanhaId}`);
    revalidatePath(`/admin/campanhas/${campanhaId}/chamada`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao adicionar" };
  }
}

export async function removeParticipanteAction(
  campanhaId: string,
  caravaneiroId: string,
) {
  await requireSessionUser(["admin"]);
  try {
    await removeParticipante(campanhaId, caravaneiroId);
    revalidatePath(`/admin/campanhas/${campanhaId}`);
    revalidatePath(`/admin/campanhas/${campanhaId}/chamada`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao remover" };
  }
}

export async function marcarPresencaAction(
  campanhaId: string,
  caravaneiroId: string,
  metodo: "QR" | "MANUAL" = "MANUAL",
) {
  const user = await requireSessionUser(["admin"]);

  const campanha = await getCampanha(campanhaId);
  if (!campanha || campanha.status !== "ATIVA") {
    return { error: "Chamada só em campanhas ativas" };
  }

  try {
    await marcarPresenca({
      campanhaId,
      caravaneiroId,
      registradoPor: user.id,
      metodo,
    });
    revalidatePath(`/admin/campanhas/${campanhaId}/chamada`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao marcar presença" };
  }
}

export async function removerPresencaAction(
  campanhaId: string,
  caravaneiroId: string,
) {
  await requireSessionUser(["admin"]);
  try {
    await removerPresenca(campanhaId, caravaneiroId);
    revalidatePath(`/admin/campanhas/${campanhaId}/chamada`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao remover presença" };
  }
}

export async function marcarPresencaQrAction(campanhaId: string, qrPayload: string) {
  const user = await requireSessionUser(["admin"]);

  const campanha = await getCampanha(campanhaId);
  if (!campanha || campanha.status !== "ATIVA") {
    return { error: "Chamada só em campanhas ativas" };
  }

  const publicId = parsePublicIdFromQrPayload(qrPayload);
  if (!publicId) return { error: "QR inválido" };

  const caravaneiroId = await getCaravaneiroIdByPublicId(publicId);
  if (!caravaneiroId) {
    return { error: "Caravaneiro não encontrado ou inativo" };
  }

  try {
    await marcarPresenca({
      campanhaId,
      caravaneiroId,
      registradoPor: user.id,
      metodo: "QR",
    });
    revalidatePath(`/admin/campanhas/${campanhaId}/chamada`);
    return { success: true, caravaneiroId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao registrar QR" };
  }
}
