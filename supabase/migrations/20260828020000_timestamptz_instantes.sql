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
