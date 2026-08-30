export const dynamic = "force-dynamic";

import Link from "next/link";
import { getDashboardStats } from "@/lib/supabase/db";

export default async function RelatoriosPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1]">
          Relatórios
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumo geral do sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-slate-600">Administradores</p>
          <p className="text-3xl font-bold text-[#0d47a1]">
            {stats.adminsCount}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-slate-600">Caravaneiros</p>
          <p className="text-3xl font-bold text-[#0d47a1]">
            {stats.caravaneirosCount}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-sm text-slate-600">Ativos</p>
          <p className="text-3xl font-bold text-[#0d47a1]">
            {stats.ativosCount}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Acesse os cadastros para consultar as listas completas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-xl bg-[#1976d2] px-4 py-2 text-sm font-semibold text-white"
            href="/admin/caravaneiros"
          >
            Caravaneiros
          </Link>
          <Link
            className="rounded-xl bg-[#1976d2] px-4 py-2 text-sm font-semibold text-white"
            href="/admin/doacoes"
          >
            Doações
          </Link>
          <Link
            className="rounded-xl bg-[#1976d2] px-4 py-2 text-sm font-semibold text-white"
            href="/admin/campanhas"
          >
            Campanhas
          </Link>
        </div>
      </div>
    </div>
  );
}
