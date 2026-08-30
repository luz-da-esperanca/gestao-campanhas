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
