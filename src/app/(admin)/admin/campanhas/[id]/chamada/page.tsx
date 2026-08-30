import { notFound, redirect } from "next/navigation";
import { getCampanha } from "@/lib/supabase/campanhas";
import { getChamadaLista } from "@/lib/supabase/presencas";
import { listParticipantes } from "@/lib/supabase/participantes";
import { ChamadaClient } from "@/components/admin/chamada-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function ChamadaPage({ params }: PageProps) {
  const { id } = await params;
  const campanha = await getCampanha(id);

  if (!campanha) notFound();
  if (campanha.status !== "ATIVA") {
    redirect(`/admin/campanhas/${id}`);
  }

  const [items, participantes] = await Promise.all([
    getChamadaLista(id),
    listParticipantes(id),
  ]);

  return (
    <ChamadaClient
      campanhaId={id}
      campanhaNome={campanha.nome}
      items={items}
      usaListaAberta={participantes.length === 0}
    />
  );
}
