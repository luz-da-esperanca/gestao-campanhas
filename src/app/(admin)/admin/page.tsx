export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getDashboardStats, getDashboardActivity } from "@/lib/supabase/db";
import { Bell, Package, Users, UserPlus } from "lucide-react";
import { listRotasMapa } from "@/lib/supabase/campanhas";
import { DashboardTaskStatus } from "@/components/admin/dashboard-task-status";
import { DashboardRecentDonations } from "@/components/admin/dashboard-recent-donations";
import { DashboardCampaignStatus } from "@/components/admin/dashboard-campaign-status";
import { DashboardRouteMap } from "@/components/admin/dashboard-route-map";

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
  const [user, stats, rotas, activity] = await Promise.all([
    getSessionUser(),
    getDashboardStats(),
    listRotasMapa(),
    getDashboardActivity(),
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
          <DashboardCampaignStatus
            planejadas={stats.campanhasPlanejadasCount}
            ativas={stats.campanhasAtivasCount}
            encerradas={stats.campanhasEncerradasCount}
          />

          <DashboardTaskStatus
            pendentes={activity.pendentes}
            andamento={activity.andamento}
            concluidas={activity.concluidas}
          />

          <DashboardRecentDonations doacoes={activity.doacoes} />

          <DashboardRouteMap rotas={rotas} />
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
