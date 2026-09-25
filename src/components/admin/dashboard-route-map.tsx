"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { RotaRow } from "@/lib/supabase/campanhas";

const Map = dynamic(() => import("./dashboard-route-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-sm" role="status">
      Carregando mapa…
    </div>
  ),
});

export function DashboardRouteMap({ rotas }: { rotas: RotaRow[] }) {
  return (
    <section className="glass-card min-w-0 rounded-2xl p-6 lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-[#0d47a1]">Mapa de Rotas</h2>
        <Link href="/admin/rotas" className="text-sm text-primary underline">
          Gerenciar rotas
        </Link>
      </div>
      {rotas.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {rotas.length} rota(s) com percurso. Clique em uma linha para ver a rota e abrir sua campanha.
          </p>
          <Map rotas={rotas} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p>Nenhuma rota com percurso desenhado ainda.</p>
          <p className="mt-2">Abra uma campanha e desenhe o percurso em “Rotas e mapa”.</p>
          <Link href="/admin/campanhas" className="mt-4 inline-block font-medium text-primary underline">
            Abrir campanhas
          </Link>
        </div>
      )}
    </section>
  );
}
