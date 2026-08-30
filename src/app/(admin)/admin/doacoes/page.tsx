export const dynamic = "force-dynamic";

import { createDoacaoAction } from "@/lib/admin/cadastro-actions";
import { getDb } from "@/lib/supabase/db";
import { formatarData } from "@/lib/format-date";
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

type Doacao = {
  id: string;
  item: string | null;
  quantidade: number | null;
  doador: string | null;
  status: string | null;
  observacao: string | null;
  created_at: string;
};

export default async function DoacoesPage() {
  const { data, error } = await getDb()
    .from("arrecadacoes")
    .select("id,item,quantidade,doador,status,observacao,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const doacoes = (data ?? []) as Doacao[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1]">
          Doações
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre alimentos, roupas e outras arrecadações.
        </p>
      </div>

      <form
        action={createDoacaoAction}
        className="glass-card grid gap-4 rounded-2xl p-5 md:grid-cols-5"
      >
        <div className="space-y-2 md:col-span-2">
          <Label>Item</Label>
          <Input name="item" placeholder="Arroz 5kg" required />
        </div>
        <div className="space-y-2">
          <Label>Quantidade</Label>
          <Input name="quantidade" type="number" min="1" defaultValue="1" required />
        </div>
        <div className="space-y-2">
          <Label>Doador</Label>
          <Input name="doador" placeholder="Nome do doador" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            name="status"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
          >
            <option value="recebida">Recebida</option>
            <option value="separada">Separada</option>
            <option value="entregue">Entregue</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-5">
          <Label>Observação</Label>
          <Input name="observacao" placeholder="Detalhes da doação" />
        </div>
        <Button className="md:col-span-5" type="submit">
          Cadastrar doação
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead>Doador</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doacoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhuma doação cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              doacoes.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <p className="font-medium">{d.item ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.observacao ?? ""}
                    </p>
                  </TableCell>
                  <TableCell>{d.quantidade ?? 1}</TableCell>
                  <TableCell>{d.doador ?? "—"}</TableCell>
                  <TableCell>{d.status ?? "recebida"}</TableCell>
                  <TableCell>
                    {formatarData(d.created_at)}
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
