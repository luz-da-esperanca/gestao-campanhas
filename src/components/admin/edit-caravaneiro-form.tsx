"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCaravaneiroAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

type EditCaravaneiroFormProps = {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
  onSuccess?: () => void;
};

export function EditCaravaneiroForm({
  id,
  nome,
  telefone,
  ativo,
  onSuccess,
}: EditCaravaneiroFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return (await updateCaravaneiroAction(formData)) ?? null;
    },
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Caravaneiro atualizado");
      router.refresh();
      onSuccess?.();
    }
  }, [state?.success, onSuccess, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={nome}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          defaultValue={telefone ?? ""}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ativo">Status</Label>
        <select
          id="ativo"
          name="ativo"
          defaultValue={ativo ? "true" : "false"}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>
      </div>
      <Button type="submit" disabled={pending} className="h-11">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
