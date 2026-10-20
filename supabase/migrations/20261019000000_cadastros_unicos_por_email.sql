-- Um e-mail identifica uma pessoa, independentemente de caixa e espaços externos.
-- Preserva registros históricos, inclusive solicitações repetidas já existentes.
-- Os índices auxiliam a consulta; os triggers serializam novas escritas por e-mail.
CREATE INDEX IF NOT EXISTS users_email_normalizado_idx
  ON public.users (lower(btrim(email)));
CREATE INDEX IF NOT EXISTS caravaneiros_email_normalizado_idx
  ON public.caravaneiros (lower(btrim(email)));
CREATE INDEX IF NOT EXISTS solicitacoes_email_normalizado_idx
  ON public.solicitacoes_caravaneiro (lower(btrim(email)));

CREATE OR REPLACE FUNCTION public.impedir_usuario_duplicado()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.email, 0));

  IF EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(btrim(email)) = NEW.email AND id IS DISTINCT FROM NEW.id
  ) OR EXISTS (
    SELECT 1 FROM public.caravaneiros
    WHERE lower(btrim(email)) = NEW.email AND user_id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'Já existe um usuário com este e-mail.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS impedir_usuario_duplicado ON public.users;
CREATE TRIGGER impedir_usuario_duplicado
BEFORE INSERT OR UPDATE OF email ON public.users
FOR EACH ROW EXECUTE FUNCTION public.impedir_usuario_duplicado();

CREATE OR REPLACE FUNCTION public.impedir_caravaneiro_duplicado()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));
  IF NEW.email IS NULL THEN RETURN NEW; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.email, 0));

  IF EXISTS (
    SELECT 1 FROM public.caravaneiros
    WHERE lower(btrim(email)) = NEW.email AND id IS DISTINCT FROM NEW.id
  ) OR EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(btrim(email)) = NEW.email AND id IS DISTINCT FROM NEW.user_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'Já existe um caravaneiro com este e-mail.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS impedir_caravaneiro_duplicado ON public.caravaneiros;
CREATE TRIGGER impedir_caravaneiro_duplicado
BEFORE INSERT OR UPDATE OF email, user_id ON public.caravaneiros
FOR EACH ROW EXECUTE FUNCTION public.impedir_caravaneiro_duplicado();

CREATE OR REPLACE FUNCTION public.impedir_solicitacao_repetida()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));
  -- O mesmo lock é usado pelos cadastros para cobrir submissões concorrentes.
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.email, 0));

  IF EXISTS (
    SELECT 1 FROM public.solicitacoes_caravaneiro
    WHERE lower(btrim(email)) = NEW.email AND id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'Já existe uma solicitação com este e-mail.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.users WHERE lower(btrim(email)) = NEW.email
  ) OR EXISTS (
    SELECT 1 FROM public.caravaneiros WHERE lower(btrim(email)) = NEW.email
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'Já existe um cadastro com este e-mail.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS impedir_solicitacao_repetida ON public.solicitacoes_caravaneiro;
CREATE TRIGGER impedir_solicitacao_repetida
BEFORE INSERT OR UPDATE OF email ON public.solicitacoes_caravaneiro
FOR EACH ROW EXECUTE FUNCTION public.impedir_solicitacao_repetida();
