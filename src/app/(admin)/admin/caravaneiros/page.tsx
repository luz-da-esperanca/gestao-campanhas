export const dynamic = "force-dynamic";

import { listCaravaneiros } from "@/lib/supabase/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CaravaneirosPageClient } from "./caravaneiros-client";
import { CaravaneiroQrDialog } from "@/components/admin/caravaneiro-qr-dialog";
import { CaravaneiroRowActions } from "./caravaneiro-row-actions";

export default async function CaravaneirosPage() {
  const caravaneiros = await listCaravaneiros();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Caravaneiros</h1>
          <p className="text-muted-foreground">
            Cadastro, status e QR code individual.
          </p>
        </div>
        <CaravaneirosPageClient />
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {caravaneiros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum caravaneiro cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              caravaneiros.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                  <TableCell>{c.telefone ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.ativo ? "default" : "secondary"}>
                      {c.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-1">
                    <CaravaneiroQrDialog publicId={c.publicId} nome={c.nome} />
                    <CaravaneiroRowActions
                      id={c.id}
                      nome={c.nome}
                      telefone={c.telefone}
                      ativo={c.ativo}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
