import { notFound } from "next/navigation";
import { getCaravaneiroByPublicId } from "@/lib/supabase/db";
import { APP_NAME } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

type ConsultaPageProps = {
  params: Promise<{ publicId: string }>;
};

export default async function ConsultaPage({ params }: ConsultaPageProps) {
  const { publicId } = await params;
  const caravaneiro = await getCaravaneiroByPublicId(publicId);
  if (!caravaneiro) notFound();

  return (
    <main className="soft-page flex min-h-dvh flex-col items-center justify-center p-4">
      <div className="glass-card w-full max-w-sm rounded-2xl p-6 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#e3f2fd] text-[#0d47a1]">
          <UserCircle className="size-10" />
        </div>
        <h1 className="text-xl font-bold text-[#0d47a1]">{caravaneiro.nome}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {APP_NAME} — Consulta pública
        </p>
        <div className="mt-4">
          <Badge variant={caravaneiro.ativo ? "default" : "secondary"}>
            {caravaneiro.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Esta página exibe apenas o nome e o status do caravaneiro, para
          validação via QR code.
        </p>
      </div>
    </main>
  );
}
