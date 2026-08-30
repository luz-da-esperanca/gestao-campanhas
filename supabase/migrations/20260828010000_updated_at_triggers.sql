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
