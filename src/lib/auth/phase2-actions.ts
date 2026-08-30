"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb } from "@/lib/supabase/db";
import { requireSessionUser } from "@/lib/auth/session";
import { createAuthUser } from "@/lib/auth/users";
import {
  createCampanha,
  createArrecadacao,
  deleteRota,
  saveRota,
  updateCampanhaStatus,
} from "@/lib/supabase/campanhas";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";

const solicitarSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  mensagem: z.string().optional(),
});

export async function solicitarCaravaneiroAction(formData: FormData) {
  const parsed = solicitarSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone")?.toString() || undefined,
    mensagem: formData.get("mensagem")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    const { createSolicitacao } = await import("@/lib/supabase/solicitacoes");
    await createSolicitacao(parsed.data);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao enviar solicitação";
    return { error: message };
  }
}

export async function aprovarSolicitacaoAction(
  solicitacaoId: string,
  password: string,
) {
  await requireSessionUser(["admin"]);

  if (!password || password.length < 8) {
    return { error: "Senha inicial deve ter no mínimo 8 caracteres" };
  }

  const { getSolicitacao, updateSolicitacaoStatus } = await import(
    "@/lib/supabase/solicitacoes"
  );
  const sol = await getSolicitacao(solicitacaoId);
  if (!sol || sol.status !== "PENDENTE") {
    return { error: "Solicitação não encontrada" };
  }

  const publicId = nanoid(10);

  try {
    const authUser = await createAuthUser({
      email: sol.email,
      password,
      name: sol.nome,
      role: "caravaneiro",
      active: true,
    });

    const { error: cErr } = await getDb().from("caravaneiros").insert({
      user_id: authUser.id,
      nome: sol.nome,
      email: sol.email,
      telefone: sol.telefone,
      public_id: publicId,
      ativo: true,
    });

    if (cErr) {
      const supabase = createAdminClient();
      await supabase.from("users").delete().eq("id", authUser.id);
      await supabase.auth.admin.deleteUser(authUser.id);
      return { error: cErr.message };
    }

    await updateSolicitacaoStatus(solicitacaoId, "APROVADA");
    revalidatePath("/admin/solicitacoes");
    revalidatePath("/admin/caravaneiros");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao aprovar";
    return { error: message };
  }
}

export async function recusarSolicitacaoAction(solicitacaoId: string) {
  await requireSessionUser(["admin"]);

  const { getSolicitacao, updateSolicitacaoStatus } = await import(
    "@/lib/supabase/solicitacoes"
  );
  const sol = await getSolicitacao(solicitacaoId);
  if (!sol || sol.status !== "PENDENTE") {
    return { error: "Solicitação não encontrada" };
  }

  await updateSolicitacaoStatus(solicitacaoId, "RECUSADA");
  revalidatePath("/admin/solicitacoes");
  return { success: true };
}

const campanhaSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  tipo: z.enum(["DISTRIBUICAO", "COLETA", "ESPECIAL"]),
  descricao: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

export async function createCampanhaAction(formData: FormData) {
  await requireSessionUser(["admin"]);

  const parsed = campanhaSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    descricao: formData.get("descricao")?.toString() || undefined,
    dataInicio: formData.get("dataInicio")?.toString() || undefined,
    dataFim: formData.get("dataFim")?.toString() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  let campanha;
  try {
    campanha = await createCampanha({
      nome: parsed.data.nome,
      tipo: parsed.data.tipo as CampanhaTipo,
      descricao: parsed.data.descricao,
      dataInicio: parsed.data.dataInicio,
      dataFim: parsed.data.dataFim,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar campanha";
    return { error: message };
  }

  revalidatePath("/admin/campanhas");
  redirect(`/admin/campanhas/${campanha.id}`);
}

export async function updateCampanhaStatusAction(
  campanhaId: string,
  status: CampanhaStatus,
) {
  await requireSessionUser(["admin"]);

  try {
    await updateCampanhaStatus(campanhaId, status);
    revalidatePath(`/admin/campanhas/${campanhaId}`);
    revalidatePath("/admin/campanhas");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao atualizar status";
    return { error: message };
  }
}

export async function saveRotaAction(formData: FormData) {
  await requireSessionUser(["admin"]);

  const campanhaId = formData.get("campanhaId")?.toString();
  const nome = formData.get("nome")?.toString();
  const pathJson = formData.get("path")?.toString();

  if (!campanhaId || !nome || nome.length < 2) {
    return { error: "Dados inválidos" };
  }

  let path: Array<{ lat: number; lng: number }> = [];
  try {
    path = JSON.parse(pathJson ?? "[]");
    if (!Array.isArray(path) || path.length < 2) {
      return { error: "Adicione pelo menos 2 pontos na rota" };
    }
  } catch {
    return { error: "Rota inválida" };
  }

  try {
    await saveRota({ campanhaId, nome, path });
    revalidatePath(`/admin/campanhas/${campanhaId}`);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao salvar rota";
    return { error: message };
  }
}

export async function deleteRotaAction(rotaId: string, campanhaId: string) {
  await requireSessionUser(["admin"]);

  try {
    await deleteRota(rotaId);
    revalidatePath(`/admin/campanhas/${campanhaId}`);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao excluir rota";
    return { error: message };
  }
}

export async function createArrecadacaoAction(formData: FormData) {
  const user = await requireSessionUser(["admin"]);

  const campanhaId = formData.get("campanhaId")?.toString();
  const itemId = formData.get("itemId")?.toString();
  const descricaoOutros = formData.get("descricaoOutros")?.toString();
  const quantidade = Number(formData.get("quantidade"));
  const observacao = formData.get("observacao")?.toString();

  if (!campanhaId || !quantidade || quantidade < 1) {
    return { error: "Dados inválidos" };
  }

  if (!itemId && !descricaoOutros) {
    return { error: "Selecione um item ou descreva em Outros" };
  }

  try {
    await createArrecadacao({
      campanhaId,
      itemId: itemId || undefined,
      descricaoOutros: descricaoOutros || undefined,
      quantidade,
      observacao: observacao || undefined,
      registradoPor: user.id,
    });
    revalidatePath(`/admin/campanhas/${campanhaId}`);
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao registrar";
    return { error: message };
  }
}
