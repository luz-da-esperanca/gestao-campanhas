-- A coleta acompanha as rotas da distribuição até personalizar uma cópia.
-- Não associa campanhas antigas por nome ou data.
ALTER TABLE public.campanhas
  ADD COLUMN IF NOT EXISTS distribuicao_id uuid REFERENCES public.campanhas(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS rotas_personalizadas boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS campanhas_distribuicao_id_idx ON public.campanhas(distribuicao_id);

CREATE OR REPLACE FUNCTION public.validar_distribuicao_coleta()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF NEW.distribuicao_id IS NOT NULL THEN
    IF NEW.tipo <> 'COLETA' OR NEW.distribuicao_id = NEW.id THEN
      RAISE EXCEPTION 'Somente uma coleta pode acompanhar uma distribuição';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.campanhas WHERE id = NEW.distribuicao_id AND tipo = 'DISTRIBUICAO') THEN
      RAISE EXCEPTION 'Campanha de distribuição não encontrada';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.tipo <> OLD.tipo AND EXISTS (SELECT 1 FROM public.campanhas WHERE distribuicao_id = OLD.id) THEN
      RAISE EXCEPTION 'Esta distribuição possui coletas vinculadas';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validar_distribuicao_coleta ON public.campanhas;
CREATE TRIGGER validar_distribuicao_coleta
BEFORE INSERT OR UPDATE ON public.campanhas
FOR EACH ROW EXECUTE FUNCTION public.validar_distribuicao_coleta();

CREATE OR REPLACE FUNCTION public.proteger_rotas_herdadas()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
DECLARE
  campanha public.campanhas%ROWTYPE;
  campanha_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN campanha_id := OLD.campanha_id;
  ELSE campanha_id := NEW.campanha_id;
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.campanha_id IS DISTINCT FROM OLD.campanha_id THEN
    RAISE EXCEPTION 'Uma rota não pode ser transferida entre campanhas';
  END IF;
  SELECT * INTO campanha FROM public.campanhas WHERE id = campanha_id FOR UPDATE;
  IF campanha.distribuicao_id IS NOT NULL AND NOT campanha.rotas_personalizadas THEN
    RAISE EXCEPTION 'Personalize as rotas da coleta antes de alterá-las';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS proteger_rotas_herdadas ON public.rotas;
CREATE TRIGGER proteger_rotas_herdadas
BEFORE INSERT OR UPDATE OR DELETE ON public.rotas
FOR EACH ROW EXECUTE FUNCTION public.proteger_rotas_herdadas();

-- A cópia e o desligamento da sincronização são uma única transação.
-- O bloqueio da coleta também impede cópias duplicadas em cliques concorrentes.
CREATE OR REPLACE FUNCTION public.personalizar_rotas_coleta(p_campanha_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $$
DECLARE
  coleta public.campanhas%ROWTYPE;
BEGIN
  SELECT * INTO coleta FROM public.campanhas WHERE id = p_campanha_id FOR UPDATE;
  IF NOT FOUND OR coleta.tipo <> 'COLETA' OR coleta.distribuicao_id IS NULL THEN
    RAISE EXCEPTION 'Coleta vinculada não encontrada';
  END IF;
  IF coleta.rotas_personalizadas THEN RETURN; END IF;
  UPDATE public.campanhas SET rotas_personalizadas = true WHERE id = coleta.id;
  INSERT INTO public.rotas (campanha_id, nome, path, bairro, responsavel)
    SELECT coleta.id, nome, path, bairro, responsavel
    FROM public.rotas WHERE campanha_id = coleta.distribuicao_id;
END;
$$;

REVOKE ALL ON FUNCTION public.personalizar_rotas_coleta(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.personalizar_rotas_coleta(uuid) TO service_role;
NOTIFY pgrst, 'reload schema';
