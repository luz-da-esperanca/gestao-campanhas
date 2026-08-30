-- Fase 3: presença (chamada) e uso completo de participantes

DO $$ BEGIN
  CREATE TYPE "PresencaMetodo" AS ENUM ('QR', 'MANUAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "presencas" ADD COLUMN IF NOT EXISTS "campanha_id" UUID REFERENCES "campanhas"("id") ON DELETE CASCADE;
ALTER TABLE "presencas" ADD COLUMN IF NOT EXISTS "caravaneiro_id" UUID REFERENCES "caravaneiros"("id") ON DELETE CASCADE;
ALTER TABLE "presencas" ADD COLUMN IF NOT EXISTS "registrado_por" UUID REFERENCES "users"("id");
ALTER TABLE "presencas" ADD COLUMN IF NOT EXISTS "metodo" "PresencaMetodo" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "presencas" ADD COLUMN IF NOT EXISTS "registrado_em" TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE "presencas"
    ADD CONSTRAINT "presencas_campanha_caravaneiro_key"
    UNIQUE ("campanha_id", "caravaneiro_id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "presencas_campanha_id_idx" ON "presencas" ("campanha_id");
CREATE INDEX IF NOT EXISTS "campanha_participantes_campanha_idx"
  ON "campanha_participantes" ("campanha_id");
