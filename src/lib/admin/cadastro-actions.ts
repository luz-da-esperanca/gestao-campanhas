"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/supabase/db";

const tarefaSchema = z.object({
  titulo: z.string().min(2, "Título obrigatório"),
  descricao: z.string().optional(),
  prioridade: z.enum(["baixa", "media", "alta"]),
  status: z.enum(["pendente", "andamento", "concluida"]),
  prazo: z.string().optional(),
});

export async function createTarefaAction(formData: FormData): Promise<void> {
  await requireSessionUser(["admin"]);
  const parsed = tarefaSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao")?.toString() || undefined,
    prioridade: formData.get("prioridade") || "media",
    status: formData.get("status") || "pendente",
    prazo: formData.get("prazo")?.toString() || undefined,
  });

  if (!parsed.success) return;

  const { error } = await getDb().from("tarefas").insert({
    titulo: parsed.data.titulo,
    descricao: parsed.data.descricao ?? null,
    prioridade: parsed.data.prioridade,
    status: parsed.data.status,
    prazo: parsed.data.prazo || null,
  });

  if (error) return;
  revalidatePath("/admin/tarefas");
  revalidatePath("/admin");
}

const doacaoSchema = z.object({
  item: z.string().min(2, "Item obrigatório"),
  quantidade: z.coerce.number().int().min(1, "Quantidade inválida"),
  doador: z.string().optional(),
  status: z.enum(["recebida", "separada", "entregue"]),
  observacao: z.string().optional(),
});

export async function createDoacaoAction(formData: FormData): Promise<void> {
  await requireSessionUser(["admin"]);
  const parsed = doacaoSchema.safeParse({
    item: formData.get("item"),
    quantidade: formData.get("quantidade") || 1,
    doador: formData.get("doador")?.toString() || undefined,
    status: formData.get("status") || "recebida",
    observacao: formData.get("observacao")?.toString() || undefined,
  });

  if (!parsed.success) return;

  const { error } = await getDb().from("arrecadacoes").insert({
    item: parsed.data.item,
    quantidade: parsed.data.quantidade,
    doador: parsed.data.doador ?? null,
    status: parsed.data.status,
    observacao: parsed.data.observacao ?? null,
  });

  if (error) return;
  revalidatePath("/admin/doacoes");
  revalidatePath("/admin");
}

const rotaSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  bairro: z.string().optional(),
  responsavel: z.string().optional(),
});

export async function createRotaAction(formData: FormData): Promise<void> {
  await requireSessionUser(["admin"]);
  const parsed = rotaSchema.safeParse({
    nome: formData.get("nome"),
    bairro: formData.get("bairro")?.toString() || undefined,
    responsavel: formData.get("responsavel")?.toString() || undefined,
  });

  if (!parsed.success) return;

  const { error } = await getDb().from("rotas").insert({
    nome: parsed.data.nome,
    bairro: parsed.data.bairro ?? null,
    responsavel: parsed.data.responsavel ?? null,
  });

  if (error) return;
  revalidatePath("/admin/rotas");
  revalidatePath("/admin");
}
