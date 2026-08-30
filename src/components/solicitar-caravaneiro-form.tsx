"use client";

import { useActionState } from "react";
import { solicitarCaravaneiroAction } from "@/lib/auth/phase2-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SolicitarCaravaneiroForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return (await solicitarCaravaneiroAction(formData)) ?? null;
    },
    null,
  );

  if (state?.success) {
    return (
      <Alert>
        <AlertDescription>
          Solicitação enviada! A administração vai analisar e entrar em contato
          por e-mail para liberar seu acesso como caravaneiro.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome completo</Label>
        <Input id="nome" name="nome" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail para contato</Label>
        <Input id="email" name="email" type="email" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone / WhatsApp</Label>
        <Input id="telefone" name="telefone" type="tel" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem (opcional)</Label>
        <Input
          id="mensagem"
          name="mensagem"
          placeholder="Por que quer participar?"
          className="h-11"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Enviando..." : "Enviar solicitação"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Não cria login automaticamente. Um administrador aprova e envia suas
        credenciais.
      </p>
    </form>
  );
}
