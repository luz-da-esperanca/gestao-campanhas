import Link from "next/link";

type Props = {
  pendentes: number;
  andamento: number;
  concluidas: number;
};

export function DashboardTaskStatus({ pendentes, andamento, concluidas }: Props) {
  const total = pendentes + andamento + concluidas;
  const statuses = [
    { label: "Pendentes", count: pendentes, color: "bg-amber-500" },
    { label: "Em andamento", count: andamento, color: "bg-blue-600" },
    { label: "Concluídas", count: concluidas, color: "bg-emerald-600" },
  ];

  return (
    <section className="glass-card min-w-0 rounded-2xl p-6" aria-labelledby="task-status-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="task-status-title" className="font-bold text-[#0d47a1]">
          Tarefas cadastradas
        </h2>
        <Link href="/admin/tarefas" className="text-sm text-primary underline">
          Ver tarefas
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {total === 0
          ? "Nenhuma tarefa cadastrada ainda."
          : `${total} ${total === 1 ? "tarefa cadastrada" : "tarefas cadastradas"}`}
      </p>
      <dl className="mt-6 space-y-5">
        {statuses.map(({ label, count, color }) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="font-medium">{label}</dt>
                <dd className="tabular-nums">
                  <span className="font-semibold">{count}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({percentage.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)
                  </span>
                </dd>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </dl>
      {total === 0 && (
        <Link href="/admin/tarefas" className="mt-5 inline-block text-sm font-medium text-primary underline">
          Cadastrar primeira tarefa
        </Link>
      )}
    </section>
  );
}
