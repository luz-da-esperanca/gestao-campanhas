import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCampanha,
  listRotasByCampanha,
  getArrecadacaoResumo,
} from "@/lib/supabase/campanhas";
import { PublicShell } from "@/components/public/public-shell";
import { RouteMapViewer } from "@/components/public/route-map-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

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

export default async function CampanhaPublicaPage({ params }: PageProps) {
  const { id } = await params;
  const campanha = await getCampanha(id);

  if (
    !campanha ||
    (campanha.status !== "ATIVA" && campanha.status !== "ENCERRADA")
  ) {
    notFound();
  }

  const [rotas, resumo] = await Promise.all([
    listRotasByCampanha(id),
    campanha.status === "ENCERRADA" ? getArrecadacaoResumo(id) : Promise.resolve([]),
  ]);

  return (
    <PublicShell>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 -ml-2 text-muted-foreground"
          render={<Link href="/campanhas" />}
        >
          <ArrowLeft className="size-4" />
          Todas as campanhas
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{campanha.nome}</h1>
            <p className="mt-1 text-muted-foreground">
              {tipoLabel[campanha.tipo]}
              {campanha.descricao ? ` · ${campanha.descricao}` : ""}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(statusStyle[campanha.status])}
          >
            {statusLabel[campanha.status]}
          </Badge>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Rotas no mapa</h2>
          <RouteMapViewer
            rotas={rotas.map((r) => ({
              id: r.id,
              nome: r.nome,
              path: r.path,
            }))}
          />
        </section>

        {resumo.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Resultado da campanha</h2>
            <p className="text-sm text-muted-foreground">
              Arrecadações registradas após o encerramento.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumo.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell>{r.label}</TableCell>
                    <TableCell className="text-right font-medium">
                      {r.total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Quer ajudar nas campanhas?{" "}
          <Link href="/participar" className="font-medium text-primary underline">
            Solicite participar como caravaneiro
          </Link>
          — a equipe analisa e cria seu acesso.
        </div>
      </div>
    </PublicShell>
  );
}
