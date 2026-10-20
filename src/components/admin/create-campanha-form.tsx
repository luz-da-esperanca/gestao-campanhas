"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCampanhaAction } from "@/lib/auth/phase2-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CreateCampanhaForm({ arrecadacao }: {
  arrecadacao?: { distribuicaoId: string; nome: string; data: string };
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await createCampanhaAction(formData)) ?? null;
    },
    null,
  );

  return (
    <Card className="max-w-xl border-border/60 shadow-md">
      <CardHeader>
        <CardTitle>{arrecadacao ? "Campanha de arrecadação (coleta)" : "Dados da campanha"}</CardTitle>
        <CardDescription>
          {arrecadacao
            ? arrecadacao.data
              ? "Sugerimos o domingo seguinte à distribuição de panfletos. Você pode alterar a data em caso de feriado, eleição ou outro compromisso. A arrecadação só será criada ao confirmar."
              : "A distribuição não tem data definida. Escolha a data da arrecadação; ela só será criada ao confirmar."
            : "Após criar, você pode desenhar rotas no mapa e ativar a campanha."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {arrecadacao && (
            <>
              <input type="hidden" name="distribuicaoId" value={arrecadacao.distribuicaoId} />
              <p className="text-sm text-muted-foreground">
                A coleta acompanhará as rotas da distribuição, inclusive as desenhadas depois.
                Você poderá personalizar as rotas da coleta quando precisar.
              </p>
            </>
          )}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" defaultValue={arrecadacao?.nome} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            {arrecadacao ? (
              <>
                <input type="hidden" name="tipo" value="COLETA" />
                <Input id="tipo" value="Coleta" readOnly className="h-11" />
              </>
            ) : <select
              id="tipo"
              name="tipo"
              required
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs"
            >
              <option value="DISTRIBUICAO">Distribuição</option>
              <option value="COLETA">Coleta</option>
              <option value="ESPECIAL">Especial</option>
            </select>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" name="descricao" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data da campanha (obrigatória)</Label>
            <Input
              id="dataInicio"
              name="dataInicio"
              type="date"
              defaultValue={arrecadacao?.data}
              required
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={pending} className="h-11">
            {pending ? "Criando..." : arrecadacao ? "Confirmar campanha de arrecadação" : "Criar campanha"}
          </Button>
          {arrecadacao && (
            <Button
              variant="outline"
              disabled={pending}
              render={<Link href={`/admin/campanhas/${arrecadacao.distribuicaoId}`} />}
              className="h-11"
            >
              Agendar depois
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
