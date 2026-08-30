import { notFound } from "next/navigation";
import {
  getCampanha,
  listRotasByCampanha,
  listItemCatalogo,
  listArrecadacoes,
  getArrecadacaoResumo,
} from "@/lib/supabase/campanhas";
import { listParticipantes } from "@/lib/supabase/participantes";
import { listPresencas } from "@/lib/supabase/presencas";
import { listCaravaneiros } from "@/lib/supabase/db";
import { CampanhaDetailClient } from "@/components/admin/campanha-detail-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampanhaDetailPage({ params }: PageProps) {
  const { id } = await params;
  const campanha = await getCampanha(id);

  if (!campanha) notFound();

  const [
    rotas,
    catalogo,
    arrecadacoes,
    resumo,
    participantes,
    presencas,
    caravaneiros,
  ] = await Promise.all([
    listRotasByCampanha(id),
    listItemCatalogo(),
    listArrecadacoes(id),
    getArrecadacaoResumo(id),
    listParticipantes(id),
    listPresencas(id),
    listCaravaneiros(),
  ]);

  return (
    <CampanhaDetailClient
      campanha={campanha}
      rotas={rotas}
      catalogo={catalogo}
      arrecadacoes={arrecadacoes}
      resumo={resumo}
      participantes={participantes}
      presencasCount={presencas.length}
      caravaneiros={caravaneiros}
    />
  );
}
