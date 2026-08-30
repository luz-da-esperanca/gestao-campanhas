import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getCaravaneiroByUserId } from "@/lib/data/caravaneiro";
import { getConsultaUrl } from "@/lib/constants";
import { QrDisplay } from "@/components/qr-display";

export default async function CaravaneiroQrPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const caravaneiro = await getCaravaneiroByUserId(user.id);
  if (!caravaneiro) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Perfil de caravaneiro não encontrado.
      </div>
    );
  }

  const url = getConsultaUrl(caravaneiro.publicId);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Meu QR</h1>
        <p className="text-muted-foreground">
          Compartilhe ou exiba para consulta pública
        </p>
      </div>
      <QrDisplay url={url} label={caravaneiro.nome} />
    </div>
  );
}
