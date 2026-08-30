"use client";

import { useActionState } from "react";
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

export function CreateCampanhaForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await createCampanhaAction(formData)) ?? null;
    },
    null,
  );

  return (
    <Card className="max-w-xl border-border/60 shadow-md">
      <CardHeader>
        <CardTitle>Dados da campanha</CardTitle>
        <CardDescription>
          Após criar, você pode desenhar rotas no mapa e ativar a campanha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              name="tipo"
              required
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs"
            >
              <option value="DISTRIBUICAO">Distribuição</option>
              <option value="COLETA">Coleta</option>
              <option value="ESPECIAL">Especial</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" name="descricao" className="h-11" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data início</Label>
              <Input
                id="dataInicio"
                name="dataInicio"
                type="date"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data fim</Label>
              <Input id="dataFim" name="dataFim" type="date" className="h-11" />
            </div>
          </div>
          <Button type="submit" disabled={pending} className="h-11">
            {pending ? "Criando..." : "Criar campanha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
