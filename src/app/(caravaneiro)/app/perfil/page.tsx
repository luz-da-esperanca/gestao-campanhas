import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getCaravaneiroByUserId } from "@/lib/data/caravaneiro";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/logout-button";
import { Separator } from "@/components/ui/separator";

export default async function CaravaneiroPerfilPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const caravaneiro = await getCaravaneiroByUserId(user.id);

  return (
    <div className="space-y-5 px-5 py-5">
      <div>
        <h1 className="text-2xl font-bold text-[#0d47a1]">Perfil</h1>
        <p className="text-sm text-muted-foreground">Seus dados no sistema</p>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h2 className="mb-4 text-sm font-bold text-[#0d47a1]">Dados pessoais</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">E-mail</p>
            <p className="font-medium">{user.email}</p>
          </div>
          {caravaneiro?.telefone && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{caravaneiro.telefone}</p>
              </div>
            </>
          )}
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge
              className="mt-1"
              variant={caravaneiro?.ativo ? "default" : "secondary"}
            >
              {caravaneiro?.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <p className="mb-3 text-sm text-muted-foreground">
          Encerrar sessão neste dispositivo
        </p>
        <LogoutButton className="w-full justify-center gap-2 text-[#0d47a1]" />
      </div>
    </div>
  );
}
