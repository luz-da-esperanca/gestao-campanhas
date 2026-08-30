"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDb, getCaravaneiroById, getUserByIdSimple } from "@/lib/supabase/db";
import { getUserById } from "@/lib/data/users";
import { requireSessionUser } from "@/lib/auth/session";
import { createAuthUser, syncUserMetadata } from "@/lib/auth/users";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Configure o Supabase em .env.local antes de fazer login. Veja o README.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou senha incorretos" };
  }

  const dbUser = await getUserById(data.user.id);

  if (!dbUser) {
    await supabase.auth.signOut();
    return { error: "Usuário não configurado no sistema" };
  }

  if (
    dbUser.role === "caravaneiro" &&
    dbUser.caravaneiro &&
    !dbUser.caravaneiro.ativo
  ) {
    await supabase.auth.signOut();
    return { error: "Conta inativa. Entre em contato com a administração." };
  }

  await syncUserMetadata(
    data.user.id,
    dbUser.role,
    dbUser.caravaneiro?.ativo ?? true,
  );

  const redirectTo = formData.get("redirect")?.toString();
  if (redirectTo && redirectTo.startsWith("/")) {
    redirect(redirectTo);
  }

  redirect(dbUser.role === "admin" ? "/admin" : "/app");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const adminSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export async function createAdminAction(formData: FormData) {
  await requireSessionUser(["admin"]);

  const parsed = adminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await createAuthUser({
      ...parsed.data,
      role: "admin",
    });
    revalidatePath("/admin/admins");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar admin";
    return { error: message };
  }
}

export async function deleteAdminAction(userId: string) {
  const current = await requireSessionUser(["admin"]);
  if (current.id === userId) {
    return { error: "Você não pode excluir sua própria conta" };
  }

  const target = await getUserByIdSimple(userId);
  if (!target || target.role !== "admin") {
    return { error: "Administrador não encontrado" };
  }

  const supabase = createAdminClient();
  await supabase.from("users").delete().eq("id", userId);
  await supabase.auth.admin.deleteUser(userId);

  revalidatePath("/admin/admins");
  return { success: true };
}

const caravaneiroSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export async function createCaravaneiroAction(formData: FormData) {
  await requireSessionUser(["admin"]);

  const parsed = caravaneiroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const publicId = nanoid(10);

  try {
    const authUser = await createAuthUser({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.nome,
      role: "caravaneiro",
      active: true,
    });

    const { error } = await getDb().from("caravaneiros").insert({
      user_id: authUser.id,
      nome: parsed.data.nome,
      email: parsed.data.email,
      telefone: parsed.data.telefone ?? null,
      public_id: publicId,
      ativo: true,
    });

    if (error) {
      const supabase = createAdminClient();
      await supabase.from("users").delete().eq("id", authUser.id);
      await supabase.auth.admin.deleteUser(authUser.id);
      throw new Error(error.message);
    }

    revalidatePath("/admin/caravaneiros");
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao criar caravaneiro";
    return { error: message };
  }
}

export async function updateCaravaneiroAction(formData: FormData) {
  await requireSessionUser(["admin"]);

  const id = formData.get("id")?.toString();
  if (!id) return { error: "ID inválido" };

  const nome = formData.get("nome")?.toString();
  const telefone = formData.get("telefone")?.toString() || null;
  const ativo = formData.get("ativo") === "true";

  if (!nome || nome.length < 2) {
    return { error: "Nome obrigatório" };
  }

  const caravaneiro = await getCaravaneiroById(id);

  if (!caravaneiro) return { error: "Caravaneiro não encontrado" };

  const { error } = await getDb()
    .from("caravaneiros")
    .update({ nome, telefone, ativo })
    .eq("id", id);

  if (error) return { error: error.message };

  if (caravaneiro.userId) {
    await getDb().from("users").update({ name: nome }).eq("id", caravaneiro.userId);
    await syncUserMetadata(caravaneiro.userId, "caravaneiro", ativo);
  }

  revalidatePath("/admin/caravaneiros");
  revalidatePath("/app");
  return { success: true };
}

export async function deleteCaravaneiroAction(id: string) {
  await requireSessionUser(["admin"]);

  const caravaneiro = await getCaravaneiroById(id);

  if (!caravaneiro) return { error: "Caravaneiro não encontrado" };

  const supabase = createAdminClient();
  await supabase.from("caravaneiros").delete().eq("id", id);

  if (caravaneiro.userId) {
    await supabase.from("users").delete().eq("id", caravaneiro.userId);
    await supabase.auth.admin.deleteUser(caravaneiro.userId);
  }

  revalidatePath("/admin/caravaneiros");
  return { success: true };
}
