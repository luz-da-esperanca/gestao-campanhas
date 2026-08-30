export const dynamic = "force-dynamic";

import { createTarefaAction } from "@/lib/admin/cadastro-actions";
import { getDb } from "@/lib/supabase/db";
import { formatarDataEscolhida } from "@/lib/format-date";
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

type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  prazo: string | null;
};

export default async function TarefasPage() {
  const { data, error } = await getDb()
    .from("tarefas")
    .select("id,titulo,descricao,prioridade,status,prazo")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const tarefas = (data ?? []) as Tarefa[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1]">
          Tarefas
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre tarefas e acompanhe o andamento.
        </p>
      </div>

      <form
        action={createTarefaAction}
        className="glass-card grid gap-4 rounded-2xl p-5 md:grid-cols-4"
      >
        <div className="space-y-2 md:col-span-2">
          <Label>Título</Label>
          <Input name="titulo" placeholder="Confirmar voluntários" required />
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <select
            name="prioridade"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
          >
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <select
            name="status"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
          >
            <option value="pendente">Pendente</option>
            <option value="andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label>Descrição</Label>
          <Input name="descricao" placeholder="Detalhes da tarefa" />
        </div>
        <div className="space-y-2">
          <Label>Prazo</Label>
          <Input name="prazo" type="date" />
        </div>
        <Button className="md:col-span-4" type="submit">
          Cadastrar tarefa
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tarefas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma tarefa cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              tarefas.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-medium">{t.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.descricao ?? ""}
                    </p>
                  </TableCell>
                  <TableCell>{t.prioridade}</TableCell>
                  <TableCell>{t.status}</TableCell>
                  <TableCell>
                    {t.prazo ? formatarDataEscolhida(t.prazo) : "—"}
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
