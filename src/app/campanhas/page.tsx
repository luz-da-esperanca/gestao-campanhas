export const dynamic = "force-dynamic";

import Link from "next/link";
import { listCampanhasPublicas } from "@/lib/supabase/campanhas";
import { PublicShell } from "@/components/public/public-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, ArrowRight } from "lucide-react";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<CampanhaStatus, string> = {
  PLANEJADA: "Planejada",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
};

const statusStyle: Record<CampanhaStatus, string> = {
  ATIVA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ENCERRADA: "bg-amber-100 text-amber-900 border-amber-200",
  PLANEJADA: "bg-slate-100 text-slate-700",
};

const tipoLabel: Record<CampanhaTipo, string> = {
  DISTRIBUICAO: "Distribuição",
  COLETA: "Coleta",
  ESPECIAL: "Especial",
};

export default async function CampanhasPublicasPage() {
  const campanhas = await listCampanhasPublicas();

  return (
    <PublicShell
      title="Campanhas"
      description="Veja como as campanhas funcionam — rotas no mapa, sem precisar de conta."
    >
      {campanhas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Megaphone className="size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Nenhuma campanha ativa ou encerrada no momento.
          </p>
          <Button variant="outline" render={<Link href="/participar" />}>
            Quero participar como caravaneiro
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campanhas.map((c) => (
            <article
              key={c.id}
              className="flex flex-col rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold leading-tight">{c.nome}</h2>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-xs", statusStyle[c.status])}
                >
                  {statusLabel[c.status]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {tipoLabel[c.tipo]}
                {c.descricao ? ` · ${c.descricao}` : ""}
              </p>
              <Button
                className="mt-4 gap-2 self-start"
                size="sm"
                render={<Link href={`/campanhas/${c.id}`} />}
              >
                Ver rotas no mapa
                <ArrowRight className="size-4" />
              </Button>
            </article>
          ))}
        </div>
      )}
    </PublicShell>
  );
}
