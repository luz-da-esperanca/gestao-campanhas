export const dynamic = "force-dynamic";

import Link from "next/link";
import { listCampanhas } from "@/lib/supabase/campanhas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import type { CampanhaStatus, CampanhaTipo } from "@/lib/auth/types";

const statusLabel: Record<CampanhaStatus, string> = {
  PLANEJADA: "Planejada",
  ATIVA: "Ativa",
  ENCERRADA: "Encerrada",
};

const tipoLabel: Record<CampanhaTipo, string> = {
  DISTRIBUICAO: "Distribuição",
  COLETA: "Coleta",
  ESPECIAL: "Especial",
};

export default async function CampanhasPage() {
  const campanhas = await listCampanhas();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1]">
            Campanhas
          </h1>
          <p className="text-muted-foreground">
            Distribuição, coleta e campanhas especiais com rotas e arrecadações.
          </p>
        </div>
        <Button render={<Link href="/admin/campanhas/new" />}>
          <Plus className="size-4" />
          Nova campanha
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campanhas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                Nenhuma campanha cadastrada.
              </TableCell>
            </TableRow>
          ) : (
            campanhas.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{tipoLabel[c.tipo]}</TableCell>
                <TableCell>
                  <Badge variant="outline">{statusLabel[c.status]}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/admin/campanhas/${c.id}`} />}
                  >
                    Abrir
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
