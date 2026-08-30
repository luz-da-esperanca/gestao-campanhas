"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAdminAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function CreateAdminForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return (await createAdminAction(formData)) ?? null;
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Administrador criado");
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
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
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
        {pending ? "Criando..." : "Criar administrador"}
      </Button>
    </form>
  );
}
