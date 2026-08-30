-- Fase 2: visitante, campanhas completas, rotas, catálogo e arrecadações

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'visitante';

DO $$ BEGIN
  CREATE TYPE "CampanhaStatus" AS ENUM ('PLANEJADA', 'ATIVA', 'ENCERRADA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItemCategoria" AS ENUM ('CESTA_BASICA', 'ROUPA_INFANTIL', 'ROUPA_ADULTO');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "campanhas" ADD COLUMN IF NOT EXISTS "status" "CampanhaStatus" NOT NULL DEFAULT 'PLANEJADA';
ALTER TABLE "campanhas" ADD COLUMN IF NOT EXISTS "descricao" TEXT;

ALTER TABLE "rotas" ADD COLUMN IF NOT EXISTS "campanha_id" UUID REFERENCES "campanhas"("id") ON DELETE CASCADE;
ALTER TABLE "rotas" ADD COLUMN IF NOT EXISTS "path" JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS "item_catalogo" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "categoria" "ItemCategoria" NOT NULL,
  "nome" TEXT NOT NULL,
  "tamanho" TEXT,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "campanha_participantes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "campanha_id" UUID NOT NULL REFERENCES "campanhas"("id") ON DELETE CASCADE,
  "caravaneiro_id" UUID NOT NULL REFERENCES "caravaneiros"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("campanha_id", "caravaneiro_id")
);

ALTER TABLE "arrecadacoes" ADD COLUMN IF NOT EXISTS "campanha_id" UUID REFERENCES "campanhas"("id") ON DELETE CASCADE;
ALTER TABLE "arrecadacoes" ADD COLUMN IF NOT EXISTS "item_id" UUID REFERENCES "item_catalogo"("id");
ALTER TABLE "arrecadacoes" ADD COLUMN IF NOT EXISTS "descricao_outros" TEXT;
ALTER TABLE "arrecadacoes" ADD COLUMN IF NOT EXISTS "quantidade" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "arrecadacoes" ADD COLUMN IF NOT EXISTS "observacao" TEXT;
ALTER TABLE "arrecadacoes" ADD COLUMN IF NOT EXISTS "registrado_por" UUID REFERENCES "users"("id");

-- Catálogo inicial (só se vazio)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM "item_catalogo" LIMIT 1) THEN
    INSERT INTO "item_catalogo" ("categoria", "nome", "tamanho") VALUES
      ('CESTA_BASICA', 'Arroz', NULL),
      ('CESTA_BASICA', 'Feijão', NULL),
      ('CESTA_BASICA', 'Macarrão', NULL),
      ('CESTA_BASICA', 'Óleo', NULL),
      ('CESTA_BASICA', 'Sal', NULL),
      ('CESTA_BASICA', 'Açúcar', NULL),
      ('CESTA_BASICA', 'Café', NULL),
      ('CESTA_BASICA', 'Leite', NULL),
      ('CESTA_BASICA', 'Farinha', NULL),
      ('CESTA_BASICA', 'Sabão em barra', NULL),
      ('CESTA_BASICA', 'Detergente', NULL),
      ('CESTA_BASICA', 'Papel higiênico', NULL),
      ('ROUPA_INFANTIL', 'Roupa infantil', 'P'),
      ('ROUPA_INFANTIL', 'Roupa infantil', 'M'),
      ('ROUPA_INFANTIL', 'Roupa infantil', 'G'),
      ('ROUPA_ADULTO', 'Roupa adulto', 'PP'),
      ('ROUPA_ADULTO', 'Roupa adulto', 'P'),
      ('ROUPA_ADULTO', 'Roupa adulto', 'M'),
      ('ROUPA_ADULTO', 'Roupa adulto', 'G'),
      ('ROUPA_ADULTO', 'Roupa adulto', 'GG');
  END IF;
END $$;
