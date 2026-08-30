import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
import { SolicitarCaravaneiroForm } from "@/components/solicitar-caravaneiro-form";

export default function ParticiparPage() {
  return (
    <PublicShell
      title="Quero ser caravaneiro"
      description="Envie uma solicitação — sem criar conta agora. A equipe analisa e libera seu acesso."
    >
      <div className="mx-auto max-w-md space-y-4">
        <SolicitarCaravaneiroForm />
        <p className="text-center text-sm text-muted-foreground">
          Só quer conhecer?{" "}
          <Link href="/campanhas" className="font-medium text-primary underline">
            Ver campanhas e rotas
          </Link>
          {" "}sem cadastro.
        </p>
      </div>
    </PublicShell>
  );
}
