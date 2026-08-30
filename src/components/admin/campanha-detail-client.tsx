"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  saveRotaAction,
  deleteRotaAction,
  updateCampanhaStatusAction,
  createArrecadacaoAction,
} from "@/lib/auth/phase2-actions";
import { RouteMapEditor } from "@/components/admin/route-map-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CampanhaParticipantes } from "@/components/admin/campanha-participantes";
import type { ParticipanteRow } from "@/lib/supabase/participantes";
import type { CaravaneiroRow } from "@/lib/supabase/db";
import {
  ArrowLeft,
  Play,
  StopCircle,
  RotateCcw,
  Package,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";
import type {
  ArrecadacaoRow,
  ItemCatalogoRow,
  RotaRow,
} from "@/lib/supabase/campanhas";

type CampanhaDetailClientProps = {
  campanha: {
    id: string;
    nome: string;
    tipo: CampanhaTipo;
    status: CampanhaStatus;
    descricao: string | null;
  };
  rotas: RotaRow[];
  catalogo: ItemCatalogoRow[];
  arrecadacoes: ArrecadacaoRow[];
  resumo: Array<{ label: string; total: number }>;
  participantes: ParticipanteRow[];
  presencasCount: number;
  caravaneiros: CaravaneiroRow[];
};

const statusLabel: Record<CampanhaStatus, string> = {
  PLANEJADA: "Planejada",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
};

const statusStyle: Record<CampanhaStatus, string> = {
  PLANEJADA: "bg-slate-100 text-slate-700 border-slate-200",
  ATIVA: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ENCERRADA: "bg-amber-100 text-amber-900 border-amber-200",
};

const tipoLabel: Record<CampanhaTipo, string> = {
  DISTRIBUICAO: "Distribuição",
  COLETA: "Coleta",
  ESPECIAL: "Especial",
};

export function CampanhaDetailClient({
  campanha,
  rotas,
  catalogo,
  arrecadacoes,
  resumo,
  participantes,
  presencasCount,
  caravaneiros,
}: CampanhaDetailClientProps) {
  const router = useRouter();
  const [rotaPending, setRotaPending] = useState(false);

  const handleStatus = async (status: CampanhaStatus) => {
    const result = await updateCampanhaStatusAction(campanha.id, status);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Status atualizado");
      router.refresh();
    }
  };

  const handleSaveRota = async (
    nome: string,
    path: Array<{ lat: number; lng: number }>,
  ) => {
    setRotaPending(true);
    const fd = new FormData();
    fd.set("campanhaId", campanha.id);
    fd.set("nome", nome);
    fd.set("path", JSON.stringify(path));
    const result = await saveRotaAction(fd);
    setRotaPending(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Rota salva");
      router.refresh();
    }
  };

  const handleDeleteRota = async (rotaId: string) => {
    const result = await deleteRotaAction(rotaId, campanha.id);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Rota removida");
      router.refresh();
    }
  };

  const [arrecState, arrecAction, arrecPending] = useActionState(
    async (
      _prev: { error?: string; success?: boolean } | null,
      formData: FormData,
    ) => {
      return (await createArrecadacaoAction(formData)) ?? null;
    },
    null,
  );

  useEffect(() => {
    if (arrecState?.success) {
      toast.success("Arrecadação registrada");
      router.refresh();
    }
  }, [arrecState?.success, router]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-2 text-muted-foreground"
        render={<Link href="/admin/campanhas" />}
      >
        <ArrowLeft className="size-4" />
        Voltar às campanhas
      </Button>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{campanha.nome}</CardTitle>
            <CardDescription className="text-base">
              {tipoLabel[campanha.tipo]}
              {campanha.descricao ? ` · ${campanha.descricao}` : ""}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn("text-sm", statusStyle[campanha.status])}
          >
            {statusLabel[campanha.status]}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 border-t pt-4">
          {campanha.status === "PLANEJADA" && (
            <Button size="sm" className="gap-2" onClick={() => handleStatus("ATIVA")}>
              <Play className="size-4" />
              Ativar campanha
            </Button>
          )}
          {campanha.status === "ATIVA" && (
            <>
              <Button
                size="sm"
                className="gap-2"
                render={
                  <Link href={`/admin/campanhas/${campanha.id}/chamada`} />
                }
              >
                <ClipboardList className="size-4" />
                Abrir chamada
                {presencasCount > 0 && ` (${presencasCount})`}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => handleStatus("ENCERRADA")}
              >
                <StopCircle className="size-4" />
                Encerrar campanha
              </Button>
            </>
          )}
          {campanha.status === "ENCERRADA" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => handleStatus("PLANEJADA")}
            >
              <RotateCcw className="size-4" />
              Reabrir como planejada
            </Button>
          )}
        </CardContent>
      </Card>

      {campanha.status !== "ENCERRADA" && (
        <>
          <CampanhaParticipantes
            campanhaId={campanha.id}
            participantes={participantes}
            caravaneirosDisponiveis={caravaneiros}
          />

          {campanha.status === "ATIVA" && presencasCount > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
              <CardContent className="flex items-center gap-3 py-4">
                <UserCheck className="size-5 text-emerald-700" />
                <div>
                  <p className="font-medium text-emerald-900">
                    {presencasCount} presença(s) registrada(s)
                  </p>
                  <p className="text-sm text-emerald-800/80">
                    Continue a chamada no celular para escanear QR ou marcar
                    manualmente.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Rotas e mapa</h2>
            <p className="text-sm text-muted-foreground">
              Planeje o percurso da campanha. O mapa usa OpenStreetMap; você pode
              exportar qualquer rota salva para navegação no Google Maps.
            </p>
          </div>
          <RouteMapEditor
            savedRotas={rotas}
            onSave={handleSaveRota}
            onDelete={handleDeleteRota}
            pending={rotaPending}
          />
        </section>
        </>
      )}

      {campanha.status === "ENCERRADA" && (
        <section className="space-y-6">
          {presencasCount > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="size-4" />
                  Presença na campanha
                </CardTitle>
                <CardDescription>
                  {presencasCount} caravaneiro(s) registrados na chamada
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <CampanhaParticipantes
            campanhaId={campanha.id}
            participantes={participantes}
            caravaneirosDisponiveis={caravaneiros}
          />

          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Arrecadações</h2>
          </div>

          <Card className="max-w-xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Registrar item</CardTitle>
              <CardDescription>
                Selecione do catálogo ou descreva em &quot;Outros&quot;.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={arrecAction} className="grid gap-4">
                <input type="hidden" name="campanhaId" value={campanha.id} />
                {arrecState?.error && (
                  <Alert variant="destructive">
                    <AlertDescription>{arrecState.error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="itemId">Item do catálogo</Label>
                  <select
                    id="itemId"
                    name="itemId"
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">— Outros —</option>
                    {catalogo.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                        {item.tamanho ? ` (${item.tamanho})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricaoOutros">
                    Outros (se não selecionou item)
                  </Label>
                  <Input
                    id="descricaoOutros"
                    name="descricaoOutros"
                    placeholder="Descreva o item"
                    className="h-11"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      name="quantidade"
                      type="number"
                      min={1}
                      required
                      defaultValue={1}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacao">Observação</Label>
                    <Input id="observacao" name="observacao" className="h-11" />
                  </div>
                </div>
                <Button type="submit" disabled={arrecPending} className="h-11">
                  {arrecPending ? "Registrando..." : "Registrar arrecadação"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {resumo.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
              </CardContent>
            </Card>
          )}

          {arrecadacoes.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Registros</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Obs.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {arrecadacoes.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          {a.itemId
                            ? `${a.itemNome}${a.itemTamanho ? ` (${a.itemTamanho})` : ""}`
                            : a.descricaoOutros}
                        </TableCell>
                        <TableCell>{a.quantidade}</TableCell>
                        <TableCell>{a.observacao ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
