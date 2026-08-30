-- Convidados = público sem login. Solicitações = quem quer ser caravaneiro.

DO $$ BEGIN
  CREATE TYPE "SolicitacaoStatus" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "solicitacoes_caravaneiro" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telefone" TEXT,
  "mensagem" TEXT,
  "status" "SolicitacaoStatus" NOT NULL DEFAULT 'PENDENTE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "solicitacoes_caravaneiro_status_idx"
  ON "solicitacoes_caravaneiro" ("status");
