"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  aprovarSolicitacaoAction,
  recusarSolicitacaoAction,
} from "@/lib/auth/phase2-actions";

export function SolicitacaoRowActions({
  id,
  nome,
}: {
  id: string;
  nome: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const aprovar = async () => {
    setPending(true);
    const result = await aprovarSolicitacaoAction(id, password);
    setPending(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success(`Caravaneiro ${nome} criado — envie a senha por e-mail`);
      setOpen(false);
      setPassword("");
      router.refresh();
    }
  };

  const recusar = async () => {
    const result = await recusarSolicitacaoAction(id);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Solicitação recusada");
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setOpen(true)}>Aprovar</Button>
        <Button size="sm" variant="outline" onClick={recusar}>
          Recusar
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar {nome}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Defina a senha inicial. Envie ao candidato por e-mail ou WhatsApp.
          </p>
          <div className="space-y-2">
            <Label htmlFor={`pwd-${id}`}>Senha inicial</Label>
            <Input
              id={`pwd-${id}`}
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
          <Button
            className="h-11 w-full"
            disabled={pending || password.length < 8}
            onClick={aprovar}
          >
            {pending ? "Criando..." : "Criar caravaneiro"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
