export const dynamic = "force-dynamic";

import Link from "next/link";
import { createRotaAction } from "@/lib/admin/cadastro-actions";
import { getDb } from "@/lib/supabase/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Rota = {
  id: string;
  nome: string;
  bairro: string | null;
  responsavel: string | null;
  campanha_id: string | null;
};

export default async function RotasPage() {
  const { data, error } = await getDb()
    .from("rotas")
    .select("id,nome,bairro,responsavel,campanha_id")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rotas = (data ?? []) as Rota[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1]">
          Rotas
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre rotas simples ou edite rotas no mapa dentro de cada campanha.
        </p>
      </div>

      <form
        action={createRotaAction}
        className="glass-card grid gap-4 rounded-2xl p-5 md:grid-cols-3"
      >
        <div className="space-y-2">
          <Label>Nome da rota</Label>
          <Input name="nome" placeholder="Rota Centro" required />
        </div>
        <div className="space-y-2">
          <Label>Bairro</Label>
          <Input name="bairro" placeholder="Centro" />
        </div>
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Input name="responsavel" placeholder="Nome do responsável" />
        </div>
        <Button className="md:col-span-3" type="submit">
          Cadastrar rota
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rota</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Campanha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rotas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma rota cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              rotas.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nome}</TableCell>
                  <TableCell>{r.bairro ?? "—"}</TableCell>
                  <TableCell>{r.responsavel ?? "—"}</TableCell>
                  <TableCell>
                    {r.campanha_id ? (
                      <Link
                        href={`/admin/campanhas/${r.campanha_id}`}
                        className="text-sm font-medium text-[#0d47a1] underline"
                      >
                        Ver no mapa
                      </Link>
                    ) : (
                      "—"
                    )}
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
