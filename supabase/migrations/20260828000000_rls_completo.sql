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
