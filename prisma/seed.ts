import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env") });
if (existsSync(resolve(process.cwd(), ".env.local"))) {
  config({ path: resolve(process.cwd(), ".env.local"), override: true });
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !serviceKey) {
    console.error(`
❌ Configure no .env.local:
   NEXT_PUBLIC_SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY (sb_secret_...)
`);
    process.exit(1);
  }

  return { url, serviceKey };
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@luzespe.local";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-123456";
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador";

  const { url, serviceKey } = getEnv();

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    console.log(`Admin já existe: ${email}`);
    return;
  }

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role: "admin", active: true },
    });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "Falha ao criar usuário no Auth");
  }

  const { error: dbError } = await supabase.from("users").insert({
    id: authData.user.id,
    email,
    name,
    role: "admin",
  });

  if (dbError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(
      `Usuário criado no Auth, mas falhou no banco: ${dbError.message}. Aplique o schema com "supabase db push" (ou cole supabase/deploy-producao.sql no SQL Editor).`,
    );
  }

  console.log(`✓ Admin criado: ${email}`);
  console.log(`  Use a senha definida em SEED_ADMIN_PASSWORD no .env.local`);
  console.log(`\n  Nota: o seed usa a API do Supabase (não precisa de DATABASE_URL).`);
  console.log(`  Para o site rodar páginas admin, ainda configure DATABASE_URL com Session pooler.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
