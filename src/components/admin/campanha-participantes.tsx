"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  addParticipanteAction,
  removeParticipanteAction,
} from "@/lib/auth/phase3-actions";
import type { ParticipanteRow } from "@/lib/supabase/participantes";
import type { CaravaneiroRow } from "@/lib/supabase/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus, X } from "lucide-react";

type CampanhaParticipantesProps = {
  campanhaId: string;
  participantes: ParticipanteRow[];
  caravaneirosDisponiveis: CaravaneiroRow[];
};

export function CampanhaParticipantes({
  campanhaId,
  participantes,
  caravaneirosDisponiveis,
}: CampanhaParticipantesProps) {
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);

  const ids = new Set(participantes.map((p) => p.caravaneiroId));
  const disponiveis = caravaneirosDisponiveis.filter(
    (c) => c.ativo && !ids.has(c.id),
  );

  const add = async (caravaneiroId: string) => {
    setAdding(caravaneiroId);
    const result = await addParticipanteAction(campanhaId, caravaneiroId);
    setAdding(null);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Participante adicionado");
      router.refresh();
    }
  };

  const remove = async (caravaneiroId: string) => {
    const result = await removeParticipanteAction(campanhaId, caravaneiroId);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Removido da campanha");
      router.refresh();
    }
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Participantes</CardTitle>
        <CardDescription>
          Caravaneiros convocados para esta campanha. A chamada usa esta lista;
          se vazia, todos os ativos aparecem na chamada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {participantes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum participante definido — chamada listará todos os caravaneiros
            ativos.
          </p>
        ) : (
          <ul className="space-y-2">
            {participantes.map((p) => (
              <li
                key={p.caravaneiroId}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div>
                  <span className="font-medium text-sm">{p.nome}</span>
                  {p.telefone && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {p.telefone}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(p.caravaneiroId)}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {disponiveis.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Adicionar caravaneiro
            </p>
            <div className="flex flex-wrap gap-2">
              {disponiveis.map((c) => (
                <Button
                  key={c.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={adding === c.id}
                  onClick={() => add(c.id)}
                >
                  <UserPlus className="size-3.5" />
                  {c.nome}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Badge variant="outline">{participantes.length} convocados</Badge>
      </CardContent>
    </Card>
  );
}
