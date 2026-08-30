import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getCaravaneiroByUserId } from "@/lib/data/caravaneiro";
import { listCampanhasDoCaravaneiro } from "@/lib/supabase/participantes";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatarDataHora } from "@/lib/format-date";
import type { CampanhaStatus } from "@/lib/auth/types";

const statusLabel: Record<CampanhaStatus, string> = {
  PLANEJADA: "Planejada",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
};

export default async function CaravaneiroCampanhasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const caravaneiro = await getCaravaneiroByUserId(user.id);
  if (!caravaneiro) redirect("/app");

  const campanhas = await listCampanhasDoCaravaneiro(caravaneiro.id);

  return (
    <div className="space-y-5 px-5 py-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d47a1]">Minhas campanhas</h1>
        <p className="text-sm text-muted-foreground">
          Campanhas em que você foi convocado
        </p>
      </div>

      {campanhas.length === 0 ? (
        <div className="glass-card rounded-2xl border-dashed p-5">
          <h2 className="text-base font-semibold text-[#0d47a1]">
            Nenhuma campanha
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Quando a administração te incluir em uma campanha, ela aparece aqui.
            Mostre seu QR na chamada para registrar presença.
          </p>
          <Link
            href="/app/qr"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl blue-gradient px-4 text-sm font-semibold text-white"
          >
            Ver meu QR para a chamada
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campanhas.map(({ campanha, presente, presencaEm }) => (
            <div key={campanha.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold leading-tight text-[#0d47a1]">
                  {campanha.nome}
                </h2>
                <Badge variant="outline">{statusLabel[campanha.status]}</Badge>
              </div>
              {campanha.descricao && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {campanha.descricao}
                </p>
              )}
              <div
                className={cn(
                  "mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                  presente
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <CheckCircle2 className="size-4 shrink-0" />
                {presente
                  ? `Presença registrada${presencaEm ? ` · ${formatarDataHora(presencaEm)}` : ""}`
                  : "Presença ainda não registrada — mostre seu QR na chamada"}
              </div>
              <Link
                href={`/campanhas/${campanha.id}`}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-100 text-sm font-medium text-[#0d47a1] transition hover:bg-blue-50"
              >
                <Megaphone className="size-4" />
                Ver rotas no mapa
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
