import Link from "next/link";
import {
  CalendarCheck,
  ChevronRight,
  CheckCircle2,
  Gift,
  Megaphone,
  QrCode,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getCaravaneiroByUserId } from "@/lib/data/caravaneiro";
import { listCampanhasDoCaravaneiro } from "@/lib/supabase/participantes";
import { Badge } from "@/components/ui/badge";

export default async function CaravaneiroHomePage() {
  const user = await getSessionUser();
  const caravaneiro = user ? await getCaravaneiroByUserId(user.id) : null;
  const campanhas = caravaneiro
    ? await listCampanhasDoCaravaneiro(caravaneiro.id)
    : [];
  const ativas = campanhas.filter((c) => c.campanha.status === "ATIVA");

  return (
    <main className="space-y-5 px-5 pb-6 pt-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d47a1]">
          Olá, {user?.name ?? "Caravaneiro"}! 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Que bom ter você aqui.
        </p>
      </div>

      {caravaneiro && (
        <div className="glass-card rounded-2xl p-4">
          <p className="mb-2 text-sm font-semibold text-[#0d47a1]">
            Seu status
          </p>
          <Badge variant={caravaneiro.ativo ? "default" : "secondary"}>
            {caravaneiro.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      )}

      <div className="glass-card rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-bold text-[#0d47a1]">
          MINHAS CAMPANHAS
        </h2>
        {ativas.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhuma campanha ativa no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {ativas.slice(0, 3).map(({ campanha, presente }) => (
              <Link
                key={campanha.id}
                href="/app/campanhas"
                className="flex items-center justify-between rounded-xl border border-blue-100 p-4 transition hover:border-[#1976d2]/40 hover:bg-blue-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-orange-50 text-[#f9a825]">
                    <Gift className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{campanha.nome}</p>
                    <p className="text-xs text-slate-500">
                      {presente ? "Presença confirmada" : "Aguardando chamada"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {presente && (
                    <CheckCircle2 className="size-5 text-emerald-600" />
                  )}
                  <ChevronRight className="size-5 text-[#0d47a1]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-bold text-[#0d47a1]">ATALHOS</h2>
        <div className="space-y-3 text-sm">
          <Link
            href="/app/qr"
            className="flex gap-3 rounded-xl border border-blue-100 p-3 transition hover:border-[#1976d2]/40 hover:bg-blue-50/50"
          >
            <QrCode className="size-5 text-[#1976d2]" />
            <span>
              Meu QR para chamada
              <br />
              <span className="text-xs text-slate-500">
                Mostre na hora da presença
              </span>
            </span>
          </Link>
          <Link
            href="/app/campanhas"
            className="flex gap-3 rounded-xl border border-blue-100 p-3 transition hover:border-[#1976d2]/40 hover:bg-blue-50/50"
          >
            <Megaphone className="size-5 text-[#1976d2]" />
            <span>
              Ver todas as campanhas
              <br />
              <span className="text-xs text-slate-500">
                Rotas e status de presença
              </span>
            </span>
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarCheck className="size-5 shrink-0 text-[#0d47a1]" />
          Presença registrada pelo admin via QR ou lista na chamada.
        </p>
      </div>
    </main>
  );
}
