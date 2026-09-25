import Link from "next/link";

type Props = {
  planejadas: number;
  ativas: number;
  encerradas: number;
};

export function DashboardCampaignStatus({ planejadas, ativas, encerradas }: Props) {
  const total = planejadas + ativas + encerradas;
  const statuses = [
    { label: "Planejadas", count: planejadas, color: "#f59e0b" },
    { label: "Ativas", count: ativas, color: "#2563eb" },
    { label: "Encerradas", count: encerradas, color: "#059669" },
  ];

  return (
    <section className="glass-card min-w-0 rounded-2xl p-6" aria-labelledby="campaign-status-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="campaign-status-title" className="font-bold text-[#0d47a1]">
          Status das campanhas
        </h2>
        <Link href="/admin/campanhas" className="text-sm text-primary underline">
          Ver campanhas
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {total === 0
          ? "Nenhuma campanha cadastrada ainda."
          : `${total} ${total === 1 ? "campanha cadastrada" : "campanhas cadastradas"}`}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
        <div className="relative size-40 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" focusable="false">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="14" />
            {total > 0 && statuses.map(({ label, count, color }, index) => {
              const percentage = (count / total) * 100;
              const offset = statuses.slice(0, index).reduce((sum, status) => sum + status.count, 0) / total * 100;
              return count > 0 ? (
                <circle
                  key={label}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={color}
                  strokeWidth="14"
                  pathLength="100"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={-offset}
                />
              ) : null;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-[#0d47a1]">{total.toLocaleString("pt-BR")}</span>
            <span className="text-xs text-muted-foreground">{total === 1 ? "campanha" : "campanhas"}</span>
          </div>
        </div>
        <dl className="min-w-0 flex-1 basis-44 space-y-4">
        {statuses.map(({ label, count, color }) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <dt className="flex items-center gap-2 font-medium">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                  {label}
                </dt>
                <dd className="tabular-nums">
                  <span className="font-semibold">{count}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({percentage.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%)
                  </span>
                </dd>
              </div>
            </div>
          );
        })}
        </dl>
      </div>
      {total === 0 && (
        <Link href="/admin/campanhas/new" className="mt-5 inline-block text-sm font-medium text-primary underline">
          Criar primeira campanha
        </Link>
      )}
    </section>
  );
}
