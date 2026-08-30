export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/supabase/db";
import { Bell, MapPin, Package, Users, Route, UserPlus } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  tone?: "blue" | "green" | "orange";
}) {
  const tones = {
    blue: "bg-[#e3f2fd] text-[#1976d2]",
    green: "bg-green-50 text-[#2e7d32]",
    orange: "bg-orange-50 text-[#f9a825]",
  };

  return (
    <div className="glass-card rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center gap-4">
        <div
          className={`grid size-12 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#0d47a1]">{value}</p>
          <p className="text-xs text-slate-600">
            {title}
            <br />
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [user, stats] = await Promise.all([
    getSessionUser(),
    getDashboardStats(),
  ]);

  return (
    <div className="space-y-6 text-[#0d1b3e]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0d47a1]">Dashboard</h1>
          <p className="text-sm text-[#1976d2]">
            Bem-vindo(a), {user?.name ?? "Administrador"}!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/solicitacoes"
            className="relative rounded-full bg-white p-3 shadow"
          >
            <UserPlus className="size-5 text-[#0d47a1]" />
            {stats.solicitacoesPendentesCount > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
            )}
          </Link>

          <Link
            href="/admin/tarefas"
            className="relative rounded-full bg-white p-3 shadow"
          >
            <Bell className="size-5 text-[#0d47a1]" />
            {stats.tarefasCount > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500" />
            )}
          </Link>

          <Link
            href="/admin/admins"
            className="grid size-11 place-items-center rounded-full bg-[#e3f2fd] text-[#0d47a1]"
          >
            <Users className="size-5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/campanhas">
          <StatCard
            title="Campanhas"
            subtitle={`${stats.campanhasAtivasCount} ativa(s)`}
            value={stats.campanhasCount}
            icon={Users}
          />
        </Link>

        <Link href="/admin/solicitacoes">
          <StatCard
            title="Solicitações"
            subtitle="Pendentes"
            value={stats.solicitacoesPendentesCount}
            icon={UserPlus}
            tone="orange"
          />
        </Link>

        <Link href="/admin/doacoes">
          <StatCard
            title="Itens"
            subtitle="Arrecadados"
            value={stats.doacoesCount}
            icon={Package}
            tone="green"
          />
        </Link>

        <Link href="/admin/caravaneiros">
          <StatCard
            title="Caravaneiros"
            subtitle="Ativos"
            value={stats.ativosCount}
            icon={Users}
            tone="orange"
          />
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <Link href="/admin/campanhas" className="glass-card rounded-2xl p-6">
            <h2 className="mb-5 font-bold text-[#0d47a1]">
              Progresso das Campanhas
            </h2>
            <div className="flex items-center gap-8">
              <div
                className="size-36 rounded-full"
                style={{
                  background: `conic-gradient(#1976d2 0 ${Math.min(100, stats.campanhasAtivasCount * 20)}%, #f9a825 ${Math.min(100, stats.campanhasAtivasCount * 20)}% ${Math.min(100, stats.campanhasAtivasCount * 20 + 25)}%, #2e7d32 ${Math.min(100, stats.campanhasAtivasCount * 20 + 25)}% 100%)`,
                }}
              >
                <div className="m-auto mt-6 grid size-24 place-items-center rounded-full bg-white text-sm font-semibold text-[#0d47a1]">
                  {stats.campanhasCount}
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="mr-2 inline-block size-3 rounded-sm bg-[#1976d2]" />
                  Ativas: {stats.campanhasAtivasCount}
                </p>
                <p>
                  <span className="mr-2 inline-block size-3 rounded-sm bg-[#f9a825]" />
                  Total cadastradas
                </p>
                <p>
                  <span className="mr-2 inline-block size-3 rounded-sm bg-[#2e7d32]" />
                  Ver detalhes e rotas
                </p>
              </div>
            </div>
          </Link>

          <Link href="/admin/tarefas" className="glass-card rounded-2xl p-6">
            <h2 className="mb-5 font-bold text-[#0d47a1]">Tarefas Cadastradas</h2>
            <div className="flex h-44 items-end gap-5 border-b border-l border-blue-100 px-4">
              {[35, 55, 70, 45, 85, Math.min(100, stats.tarefasCount * 12 || 30)].map(
                (h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-md bg-[#1976d2] shadow"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-xs text-slate-500">
                      {["Jan", "Fev", "Mar", "Abr", "Mai", "Atual"][i]}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Link>

          <Link href="/admin/doacoes" className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 font-bold text-[#0d47a1]">Doações Recentes</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-[#f5f7fa] p-3">
                <span>Total de arrecadações</span>
                <span className="text-xs font-bold text-[#0d47a1]">
                  {stats.doacoesCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#f5f7fa] p-3">
                <span>Ver lista completa</span>
                <span className="text-xs text-slate-500">Abrir</span>
              </div>
            </div>
          </Link>

          <Link href="/admin/campanhas" className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 font-bold text-[#0d47a1]">Mapa de Rotas</h2>
            <div className="relative h-44 overflow-hidden rounded-2xl bg-[#edf2f7]">
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(30deg,#dbe5ee 12%,transparent 12.5%,transparent 87%,#dbe5ee 87.5%,#dbe5ee),linear-gradient(150deg,#dbe5ee 12%,transparent 12.5%,transparent 87%,#dbe5ee 87.5%,#dbe5ee)",
                  backgroundSize: "42px 42px",
                }}
              />
              <Route className="absolute left-16 top-12 size-24 rotate-45 text-[#1976d2]" />
              <MapPin className="absolute right-14 top-16 size-8 text-[#2e7d32]" />
            </div>
          </Link>
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 font-bold text-[#0d47a1]">Tarefas Urgentes</h2>
            <div className="space-y-4 text-sm">
              <p className="flex gap-3">
                <span className="mt-1 size-3 rounded-full bg-red-500" />
                Total de tarefas: {stats.tarefasCount}
              </p>
              <p className="flex gap-3">
                <span className="mt-1 size-3 rounded-full bg-[#1976d2]" />
                Gerenciar tarefas do painel
              </p>
            </div>
            <Link
              href="/admin/tarefas"
              className="mt-5 block w-full rounded-xl bg-[#edf2f7] py-3 text-center text-sm font-semibold text-[#0d47a1]"
            >
              Ver todas
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="mb-4 font-bold text-[#0d47a1]">Próximas Campanhas</h2>
            <div className="space-y-4 text-sm">
              <p className="flex items-center justify-between">
                <span>
                  <span className="mr-3 inline-block size-3 rounded-full bg-[#2e7d32]" />
                  Campanhas cadastradas
                </span>
                <span className="text-xs text-[#0d47a1]">
                  {stats.campanhasCount}
                </span>
              </p>
            </div>
            <Link
              href="/admin/campanhas/new"
              className="mt-5 block w-full rounded-xl blue-gradient py-3 text-center text-sm font-semibold text-white"
            >
              Nova campanha
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
