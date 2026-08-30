-- ============================================================================
-- ⚠️  ARQUIVO OBSOLETO — NÃO EXECUTE
-- ============================================================================
--
-- Este arquivo está DESATUALIZADO e produz um banco INCOMPLETO, que o código
-- da aplicação não consegue usar. Foi mantido apenas como registro histórico.
--
-- Apesar do nome "setup-completo", ele cobre somente as duas primeiras
-- migrations (20260526150000_init e 20260526160000_rls). Faltam aqui:
--
--   * tabelas .... item_catalogo, campanha_participantes,
--                  solicitacoes_caravaneiro, tarefas
--   * colunas .... campanhas.status, campanhas.descricao,
--                  rotas.campanha_id, rotas.path, rotas.bairro,
--                  rotas.responsavel, presencas.* (fase 3),
--                  arrecadacoes.* (fases 2 e 3)
--   * enums ...... CampanhaStatus, ItemCategoria, SolicitacaoStatus,
--                  PresencaMetodo, e o valor 'visitante' em Role
--   * RLS ........ as 8 tabelas fechadas por 20260828000000_rls_completo
--
-- Além disso, a política users_update_own criada abaixo permite escalonamento
-- de privilégio (falta WITH CHECK) e foi REMOVIDA pela migration
-- 20260828000000_rls_completo.sql.
--
-- FONTE DE VERDADE DO SCHEMA:  supabase/migrations/
--
--   Método preferencial ..... supabase db push
--   Método alternativo ...... supabase/deploy-producao.sql (colar no SQL Editor)
--
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Conteúdo histórico. A instrução original ("cole este arquivo inteiro no SQL
-- Editor") foi REMOVIDA: seguir esse passo hoje monta um banco incompleto.
-- Use supabase/migrations/ — veja o cabeçalho acima.
-- ----------------------------------------------------------------------------

-- ========== SCHEMA ==========
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('admin', 'caravaneiro');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CampanhaTipo" AS ENUM ('DISTRIBUICAO', 'COLETA', 'ESPECIAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "caravaneiros" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "caravaneiros_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "campanhas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "tipo" "CampanhaTipo" NOT NULL,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campanhas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "rotas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "presencas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "presencas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "arrecadacoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "arrecadacoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "caravaneiros_user_id_key" ON "caravaneiros"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "caravaneiros_public_id_key" ON "caravaneiros"("public_id");

DO $$ BEGIN
  ALTER TABLE "caravaneiros" ADD CONSTRAINT "caravaneiros_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========== RLS ==========
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "caravaneiros" ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM "users" WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS users_select_own ON "users";
DROP POLICY IF EXISTS users_select_admin ON "users";
DROP POLICY IF EXISTS users_update_own ON "users";
DROP POLICY IF EXISTS caravaneiros_select_admin ON "caravaneiros";
DROP POLICY IF EXISTS caravaneiros_select_own ON "caravaneiros";
DROP POLICY IF EXISTS caravaneiros_all_admin ON "caravaneiros";

CREATE POLICY users_select_own ON "users"
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_select_admin ON "users"
  FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY users_update_own ON "users"
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY caravaneiros_select_admin ON "caravaneiros"
  FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY caravaneiros_select_own ON "caravaneiros"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY caravaneiros_all_admin ON "caravaneiros"
  FOR ALL USING (public.current_user_role() = 'admin');
