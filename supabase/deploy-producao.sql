-- =============================================================================
--  Luz da Esperança — deploy do banco  (MÉTODO ALTERNATIVO)
-- =============================================================================
--
--  >>> ESTE NÃO É O MÉTODO PREFERENCIAL. <<<
--
--  O jeito recomendado de aplicar o schema é o Supabase CLI:
--
--      supabase link --project-ref SEU-PROJECT-REF
--      supabase db push
--
--  O CLI aplica as migrations na ordem, registra quais já foram aplicadas na
--  tabela de controle do Supabase e é seguro de repetir. Use este arquivo
--  SOMENTE se o CLI não funcionar na sua máquina.
--
-- -----------------------------------------------------------------------------
--  COMO USAR ESTE ARQUIVO
-- -----------------------------------------------------------------------------
--  1. Abra o SQL Editor do seu projeto:
--       https://supabase.com/dashboard/project/SEU-PROJECT-REF/sql/new
--  2. Copie este arquivo INTEIRO e cole no editor.
--  3. Clique em Run. Deve aparecer "Success".
--
--  Este arquivo é a concatenação literal de supabase/migrations/, na ordem dos
--  nomes. O SQL não foi alterado — cada bloco traz um comentário indicando o
--  arquivo de origem. A fonte de verdade continua sendo supabase/migrations/.
--
-- -----------------------------------------------------------------------------
--  ⚠️  ARQUIVO GERADO — NÃO EDITE À MÃO
-- -----------------------------------------------------------------------------
--  Qualquer alteração feita aqui é perdida na próxima geração. Para mudar o
--  SQL, edite a migration correspondente em supabase/migrations/ e regere:
--
--      npm run db:deploy-sql
--
--  Criou uma migration nova? Este arquivo fica DESATUALIZADO até ser regerado.
--  Para conferir sem reescrever nada (útil em CI ou antes de um deploy):
--
--      npm run db:deploy-sql -- --check
--
--  O modo --check recalcula o sha256 de cada migration, compara com os hashes
--  registrados nos blocos abaixo e sai com código 1 se algo divergir —
--  migration adicionada, removida ou editada.
--
-- -----------------------------------------------------------------------------
--  ⚠️  ATENÇÃO: ESTE SCRIPT NÃO PODE SER RODADO DUAS VEZES
-- -----------------------------------------------------------------------------
--  Três migrations antigas não são idempotentes (foram deliberadamente NÃO
--  corrigidas, porque já estão aplicadas no projeto de desenvolvimento e
--  editá-las dessincronizaria o histórico do supabase db push):
--
--    * 20260526150000_init.sql
--        CREATE TYPE / CREATE TABLE / CREATE INDEX sem guarda — falha já no 1o comando
--    * 20260526160000_rls.sql
--        CREATE POLICY sem guarda (Postgres não suporta IF NOT EXISTS para políticas)
--    * 20260604000000_presenca.sql
--        o handler é 'duplicate_object', mas ADD CONSTRAINT UNIQUE levanta 42P07 'duplicate_table'
--
--  Consequência prática: se a execução falhar no meio, NÃO basta colar o
--  arquivo de novo — os comandos já executados vão dar erro de "already
--  exists" e mascarar o problema real. Nesse caso:
--
--    a) Anote a mensagem de erro e em qual bloco ela ocorreu.
--    b) Se o banco estiver VAZIO e for possível: apague o schema public
--       (DROP SCHEMA public CASCADE; CREATE SCHEMA public;) e recomece do zero.
--       ATENÇÃO: isso apaga TODOS os dados. Só faça em banco novo.
--    c) Se houver dados: rode manualmente só os blocos que ainda faltam,
--       a partir do arquivo de origem indicado no comentário de cada bloco.
--
--  As migrations de 20260828 em diante SÃO idempotentes e podem ser
--  reexecutadas isoladamente sem risco.
--
-- -----------------------------------------------------------------------------
--  CONTEÚDO (9 arquivos, na ordem de aplicação)
-- -----------------------------------------------------------------------------
--    1. 20260526150000_init.sql  (NÃO idempotente)
--    2. 20260526160000_rls.sql  (NÃO idempotente)
--    3. 20260602000000_phase2.sql
--    4. 20260603000000_guest_solicitacoes.sql
--    5. 20260604000000_presenca.sql  (NÃO idempotente)
--    6. 20260605000000_cadastros_basicos.sql
--    7. 20260828000000_rls_completo.sql
--    8. 20260828010000_updated_at_triggers.sql
--    9. 20260828020000_timestamptz_instantes.sql
--
--  Gerado por scripts/gerar-deploy-sql.ts a partir de supabase/migrations/.
-- =============================================================================




-- =============================================================================
-- BLOCO 1/9
-- ORIGEM: supabase/migrations/20260526150000_init.sql
-- sha256(12): 025de74385b5   |   NÃO idempotente — ver aviso no topo
-- =============================================================================

-- Schema inicial Luz Espe

CREATE TYPE "Role" AS ENUM ('admin', 'caravaneiro');
CREATE TYPE "CampanhaTipo" AS ENUM ('DISTRIBUICAO', 'COLETA', 'ESPECIAL');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "caravaneiros" (
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

CREATE TABLE "campanhas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "tipo" "CampanhaTipo" NOT NULL,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "campanhas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rotas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rotas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "presencas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "presencas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "arrecadacoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "arrecadacoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "caravaneiros_user_id_key" ON "caravaneiros"("user_id");
CREATE UNIQUE INDEX "caravaneiros_public_id_key" ON "caravaneiros"("public_id");

ALTER TABLE "caravaneiros"
  ADD CONSTRAINT "caravaneiros_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;


-- =============================================================================
-- BLOCO 2/9
-- ORIGEM: supabase/migrations/20260526160000_rls.sql
-- sha256(12): bbcae9235e07   |   NÃO idempotente — ver aviso no topo
-- =============================================================================

-- RLS — executar DEPOIS da migration init (20260526150000)

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


-- =============================================================================
-- BLOCO 3/9
-- ORIGEM: supabase/migrations/20260602000000_phase2.sql
-- sha256(12): fa3222ae27c1   |   idempotente
-- =============================================================================

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


-- =============================================================================
-- BLOCO 4/9
-- ORIGEM: supabase/migrations/20260603000000_guest_solicitacoes.sql
-- sha256(12): b51e2ed90704   |   idempotente
-- =============================================================================

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


-- =============================================================================
-- BLOCO 5/9
-- ORIGEM: supabase/migrations/20260604000000_presenca.sql
-- sha256(12): a1be43d00c62   |   NÃO idempotente — ver aviso no topo
-- =============================================================================

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


-- =============================================================================
-- BLOCO 6/9
-- ORIGEM: supabase/migrations/20260605000000_cadastros_basicos.sql
-- sha256(12): 4e4a616007c0   |   idempotente
-- =============================================================================

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


-- =============================================================================
-- BLOCO 7/9
-- ORIGEM: supabase/migrations/20260828000000_rls_completo.sql
-- sha256(12): 1f8e1feff34b   |   idempotente
-- =============================================================================

-- RLS completo — fecha as tabelas que ficaram descobertas desde a fase 2.
--
-- CONTEXTO
-- A migration 20260526160000_rls.sql habilitou RLS apenas em "users" e
-- "caravaneiros". As migrations seguintes (phase2, guest_solicitacoes,
-- presenca, cadastros_basicos) criaram 8 tabelas novas e nenhuma voltou a
-- tratar RLS. No Supabase, tabela em "public" sem RLS é legível E gravável
-- por qualquer portador da chave anon/publishable — que por definição é
-- pública, embarcada no JavaScript do site.
--
-- ESTRATÉGIA: negar por padrão.
-- Habilitamos RLS sem criar nenhuma política. Sem política, RLS nega tudo.
-- Isso NÃO quebra a aplicação: todo acesso a dados é server-side, via
-- src/lib/supabase/db.ts -> getDb() -> createAdminClient(), que usa a
-- SUPABASE_SERVICE_ROLE_KEY. O papel "service_role" tem o atributo BYPASSRLS
-- no Postgres do Supabase, então ignora RLS e segue funcionando normalmente.
-- src/lib/supabase/client.ts (cliente de navegador) não é importado em lugar
-- nenhum e nenhum componente client consulta tabelas diretamente.
--
-- Se algum dia o navegador precisar ler uma destas tabelas, a política
-- específica deve ser adicionada aqui, de forma explícita e mínima.
--
-- Idempotente: ENABLE ROW LEVEL SECURITY é no-op se já habilitado, e o
-- DROP POLICY usa IF EXISTS. Pode ser reexecutada com segurança.

-- ========== 1. Habilitar RLS nas 8 tabelas descobertas ==========

ALTER TABLE "campanhas"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rotas"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "presencas"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "arrecadacoes"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "item_catalogo"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "campanha_participantes"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "solicitacoes_caravaneiro" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tarefas"                  ENABLE ROW LEVEL SECURITY;

-- ========== 2. Remover users_update_own (escalonamento de privilégio) ==========
--
-- A política era:  FOR UPDATE USING (auth.uid() = id)  — sem WITH CHECK.
-- Sem WITH CHECK o Postgres reaproveita o USING para a linha nova, e como não
-- há restrição de coluna, um usuário autenticado podia executar
--   UPDATE users SET role = 'admin' WHERE id = auth.uid()
-- e se promover a admin. Nada no navegador atualiza "users": a escrita legítima
-- acontece server-side via service_role. A política só abria o buraco.

DROP POLICY IF EXISTS users_update_own ON "users";


-- =============================================================================
-- BLOCO 8/9
-- ORIGEM: supabase/migrations/20260828010000_updated_at_triggers.sql
-- sha256(12): 277a1a2f17ca   |   idempotente
-- =============================================================================

-- Triggers de updated_at.
--
-- CONTEXTO
-- As tabelas users, caravaneiros, campanhas, rotas e tarefas têm a coluna
-- updated_at NOT NULL DEFAULT CURRENT_TIMESTAMP, mas nada nunca a atualizava:
-- não havia trigger no banco, e o runtime é supabase-js, não Prisma — o
-- `@updatedAt` declarado em prisma/schema.prisma é lógica de aplicação do
-- Prisma Client, que não roda aqui. Resultado: updated_at ficava congelado no
-- instante da criação, virando uma segunda created_at silenciosamente errada.
--
-- POR QUE UMA FUNÇÃO PRÓPRIA, E NÃO A EXTENSÃO moddatetime
-- A versão anterior desta migration usava extensions.moddatetime(). Isso cria
-- três dependências frágeis: a extensão precisa existir, estar no schema
-- esperado, e o papel que aplica a migration precisa ter permissão de criá-la.
-- Testado e reproduzido: se moddatetime já estiver instalada em OUTRO schema
-- (public, por exemplo), o `CREATE EXTENSION IF NOT EXISTS ... WITH SCHEMA
-- extensions` vira no-op silencioso — não move a extensão — e a migration
-- quebra três linhas depois, no CREATE TRIGGER:
--
--     NOTICE:  extension "moddatetime" already exists, skipping
--     ERROR:   function extensions.moddatetime() does not exist
--
-- O erro aponta para a trigger, não para a causa. A função abaixo faz
-- exatamente o que moddatetime faz (NEW.updated_at = now()) em cinco linhas,
-- e elimina a categoria inteira do problema: deixa de importar se o projeto
-- tem a extensão, em qual schema ela está, e com que permissão.
--
-- solicitacoes_caravaneiro NÃO recebe trigger de propósito: o próprio código
-- já grava a coluna, em src/lib/supabase/solicitacoes.ts:66
--     .update({ status, updated_at: new Date().toISOString() })
-- Uma trigger BEFORE UPDATE ali sobrescreveria o valor enviado pelo código com
-- now() do servidor. O efeito prático seria quase idêntico, mas seriam duas
-- fontes de verdade para o mesmo dado — então fica com a escrita explícita.
--
-- IDEMPOTENTE: CREATE OR REPLACE FUNCTION e DROP TRIGGER IF EXISTS antes de
-- cada CREATE TRIGGER. Pode ser reexecutada com segurança.

-- `search_path` fixo: sem isso o Supabase Advisor sinaliza a função como
-- `function_search_path_mutable`. now() vive em pg_catalog.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at() IS
  'Trigger BEFORE UPDATE: carimba updated_at com now(). Substitui a extensão moddatetime.';

DROP TRIGGER IF EXISTS set_updated_at ON "users";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "caravaneiros";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "caravaneiros"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "campanhas";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "campanhas"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "rotas";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "rotas"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "tarefas";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "tarefas"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- BLOCO 9/9
-- ORIGEM: supabase/migrations/20260828020000_timestamptz_instantes.sql
-- sha256(12): 91a761b63d00   |   idempotente
-- =============================================================================

-- created_at / updated_at: timestamp SEM fuso  ->  TIMESTAMPTZ
--
-- CONTEXTO
-- As migrations init (20260526150000) e cadastros_basicos (20260605000000)
-- usaram TIMESTAMP(3) — herança do schema.prisma. Guardar um INSTANTE sem fuso
-- perde informação: o valor não diz a que momento absoluto se refere, e depende
-- do fuso de quem gravou. Isso é defeito técnico, independente de regra de
-- negócio.
--
-- ESCOPO — só colunas que guardam um INSTANTE (quando algo aconteceu):
--   users.created_at / updated_at
--   caravaneiros.created_at / updated_at
--   campanhas.created_at / updated_at
--   rotas.created_at / updated_at
--   tarefas.created_at / updated_at
--   presencas.created_at
--   arrecadacoes.created_at
--
-- FORA DE ESCOPO — colunas que guardam uma DATA ESCOLHIDA pelo usuário:
--   campanhas.data_inicio, campanhas.data_fim, tarefas.prazo
-- Essas vêm de <input type="date"> como "2026-03-15", sem hora e sem offset.
-- Convertê-las para TIMESTAMPTZ faria o dia exibido recuar 24h para qualquer
-- usuário a oeste de UTC (medido: 15/03 vira 14/03 em UTC-3). Ficam como estão.
--
-- As colunas de fase 2/3 (item_catalogo.created_at, campanha_participantes.
-- created_at, solicitacoes_caravaneiro.created_at/updated_at,
-- presencas.registrado_em) já nasceram TIMESTAMPTZ e não aparecem aqui.
--
-- CONVERSÃO: os valores existentes foram gravados por CURRENT_TIMESTAMP num
-- banco UTC, então são hora UTC — daí o "AT TIME ZONE 'UTC'".
--
-- IDEMPOTENTE: o bloco só altera a coluna se ela AINDA for
-- "timestamp without time zone". Reexecutar é no-op. Isso importa porque
-- aplicar "x AT TIME ZONE 'UTC'" sobre uma coluna já convertida faria o
-- caminho inverso.

DO $$
DECLARE
  alvo  text[][] := ARRAY[
    ['users','created_at'], ['users','updated_at'],
    ['caravaneiros','created_at'], ['caravaneiros','updated_at'],
    ['campanhas','created_at'], ['campanhas','updated_at'],
    ['rotas','created_at'], ['rotas','updated_at'],
    ['tarefas','created_at'], ['tarefas','updated_at'],
    ['presencas','created_at'],
    ['arrecadacoes','created_at']
  ];
  t text; c text; tipo text; i int;
BEGIN
  FOR i IN 1 .. array_length(alvo, 1) LOOP
    t := alvo[i][1];
    c := alvo[i][2];

    SELECT data_type INTO tipo
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = t AND column_name = c;

    IF tipo IS NULL THEN
      RAISE EXCEPTION 'coluna %.% não existe', t, c;
    ELSIF tipo = 'timestamp without time zone' THEN
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN %I TYPE timestamptz USING %I AT TIME ZONE ''UTC''',
        t, c, c
      );
      RAISE NOTICE 'convertida: %.%', t, c;
    ELSE
      RAISE NOTICE 'já é % : %.% (nada a fazer)', tipo, t, c;
    END IF;
  END LOOP;
END $$;

-- Revalidação das triggers de 20260828010000. ALTER COLUMN TYPE reescreve a
-- tabela; recriar aqui garante que as 5 continuam presentes e apontando para a
-- coluna certa, independentemente da ordem em que as migrations forem aplicadas.
--
-- Usa public.set_updated_at(), definida em 20260828010000 — NÃO a extensão
-- moddatetime. Se esta seção voltasse a apontar para extensions.moddatetime,
-- ela desfaria a correção da migration anterior e reintroduziria a dependência
-- de extensão que foi deliberadamente removida.

DROP TRIGGER IF EXISTS set_updated_at ON "users";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "caravaneiros";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "caravaneiros"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "campanhas";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "campanhas"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "rotas";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "rotas"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON "tarefas";
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "tarefas"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- FIM — 9 blocos aplicados.
-- Confira no painel: Table Editor deve listar 10 tabelas, e
-- Authentication > Policies deve mostrar RLS habilitado em todas elas.
-- =============================================================================
