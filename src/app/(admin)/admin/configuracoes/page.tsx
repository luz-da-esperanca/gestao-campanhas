export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1]">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Área de configurações do painel.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-semibold text-[#0d47a1]">Sistema Luz da Esperança</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Rotas conectadas: administradores, caravaneiros, campanhas (com mapa e
          chamada), solicitações, tarefas, doações e rotas.
        </p>
      </div>
    </div>
  );
}
