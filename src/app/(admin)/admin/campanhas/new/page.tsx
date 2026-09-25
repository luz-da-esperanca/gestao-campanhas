import { CreateCampanhaForm } from "@/components/admin/create-campanha-form";
import { requireSessionUser } from "@/lib/auth/session";
import { getCampanha } from "@/lib/supabase/campanhas";
import { proximoDomingo } from "@/lib/campanhas/proximo-domingo";
import { notFound } from "next/navigation";
import { z } from "zod";

export default async function NovaCampanhaPage({
  searchParams,
}: {
  searchParams: Promise<{ distribuicao?: string | string[] }>;
}) {
  await requireSessionUser(["admin"]);
  const { distribuicao: id } = await searchParams;
  let distribuicao = null;
  if (id !== undefined) {
    if (!z.uuid().safeParse(id).success || typeof id !== "string") notFound();
    distribuicao = await getCampanha(id);
    if (!distribuicao || distribuicao.tipo !== "DISTRIBUICAO") notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {distribuicao ? "Agendar arrecadação" : "Nova campanha"}
        </h1>
        <p className="text-muted-foreground">
          {distribuicao
            ? `A distribuição “${distribuicao.nome}” já está salva. Deseja agendar a arrecadação agora?`
            : "Crie a campanha e depois adicione rotas no mapa."}
        </p>
      </div>
      <CreateCampanhaForm
        key={distribuicao?.id ?? "nova"}
        arrecadacao={distribuicao ? {
          distribuicaoId: distribuicao.id,
          nome: `Arrecadação — ${distribuicao.nome}`,
          data: proximoDomingo(distribuicao.dataInicio),
        } : undefined}
      />
    </div>
  );
}
