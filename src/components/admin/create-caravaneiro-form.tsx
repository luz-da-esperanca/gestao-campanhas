"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCaravaneiroAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function CreateCaravaneiroForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return (await createCaravaneiroAction(formData)) ?? null;
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Caravaneiro criado");
      router.refresh();
      onSuccess?.();
    }
  }, [state?.success, onSuccess, router]);

  return (
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
        <Label htmlFor="email">E-mail (login)</Label>
        <Input id="email" name="email" type="email" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input id="telefone" name="telefone" type="tel" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha inicial</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="h-11"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Criando..." : "Criar caravaneiro"}
      </Button>
    </form>
  );
}
