import { CreateCampanhaForm } from "@/components/admin/create-campanha-form";

export default function NovaCampanhaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova campanha</h1>
        <p className="text-muted-foreground">
          Crie a campanha e depois adicione rotas no mapa.
        </p>
      </div>
      <CreateCampanhaForm />
    </div>
  );
}
