import Link from "next/link";
import { formatarDataHora } from "@/lib/format-date";
import type { DoacaoRecente } from "@/lib/supabase/db";

export function DashboardRecentDonations({ doacoes }: { doacoes: DoacaoRecente[] }) {
  return (
    <section className="glass-card min-w-0 rounded-2xl p-6 lg:col-span-2" aria-labelledby="recent-donations-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="recent-donations-title" className="font-bold text-[#0d47a1]">Doações recentes</h2>
        <Link href="/admin/doacoes" className="text-sm text-primary underline">Ver doações</Link>
      </div>
      {doacoes.length === 0 ? (
        <div className="mt-5 text-sm text-muted-foreground">
          <p>Nenhuma doação registrada ainda.</p>
          <Link href="/admin/doacoes" className="mt-3 inline-block font-medium text-primary underline">
            Cadastrar primeira doação
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">Últimos registros, do mais recente ao mais antigo.</p>
          <ul className="mt-4 divide-y divide-border">
            {doacoes.map((doacao) => (
              <li key={doacao.id} className="flex flex-wrap items-start justify-between gap-3 py-4 text-sm">
                <div className="min-w-0 flex-1 basis-48 break-words">
                  <p className="font-medium">{doacao.item}</p>
                  <p className="mt-1 text-muted-foreground">Doador: {doacao.doador || "Não informado"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Registrada em <time dateTime={doacao.createdAt}>{formatarDataHora(doacao.createdAt)}</time>
                  </p>
                  {doacao.campanhaId && (
                    <Link href={`/admin/campanhas/${doacao.campanhaId}`} className="mt-2 inline-block text-xs text-primary underline">
                      Ver campanha
                    </Link>
                  )}
                </div>
                <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold tabular-nums text-[#0d47a1]">
                  Qtd.: {doacao.quantidade?.toLocaleString("pt-BR") ?? "Não informada"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
