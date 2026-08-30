export const dynamic = "force-dynamic";

import { listSolicitacoesPendentes } from "@/lib/supabase/solicitacoes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SolicitacaoRowActions } from "./solicitacao-row-actions";

export default async function SolicitacoesPage() {
  const solicitacoes = await listSolicitacoesPendentes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Solicitações</h1>
        <p className="text-muted-foreground">
          Pessoas que querem ser caravaneiros. Aprove criando login ou recuse a
          solicitação.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Mensagem</TableHead>
            <TableHead className="w-48" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitacoes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Nenhuma solicitação pendente.
              </TableCell>
            </TableRow>
          ) : (
            solicitacoes.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.nome}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.telefone ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {s.mensagem ?? "—"}
                </TableCell>
                <TableCell>
                  <SolicitacaoRowActions id={s.id} nome={s.nome} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
