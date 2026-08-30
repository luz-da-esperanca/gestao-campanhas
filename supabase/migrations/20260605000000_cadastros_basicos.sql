-- Cadastros básicos do painel (tarefas, doações avulsas, rotas simples)

ALTER TABLE "rotas"
  ADD COLUMN IF NOT EXISTS "bairro" TEXT,
  ADD COLUMN IF NOT EXISTS "responsavel" TEXT;

CREATE TABLE IF NOT EXISTS "tarefas" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "prioridade" TEXT NOT NULL DEFAULT 'media',
  "status" TEXT NOT NULL DEFAULT 'pendente',
  "prazo" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "arrecadacoes"
  ADD COLUMN IF NOT EXISTS "item" TEXT,
  ADD COLUMN IF NOT EXISTS "doador" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'recebida';
