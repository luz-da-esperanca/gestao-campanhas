import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });
if (existsSync(resolve(process.cwd(), ".env.local"))) {
  config({ path: resolve(process.cwd(), ".env.local"), override: true });
}

const checks: { key: string; ok: boolean; hint: string }[] = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("supabase.co"),
    hint: "Supabase → Settings → API → Project URL",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou ANON_KEY)",
    ok:
      !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.length ||
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    hint: "Supabase → Connect → publishable (sb_publishable_)",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY (ou SECRET_KEY)",
    ok:
      !!process.env.SUPABASE_SERVICE_ROLE_KEY?.length ||
      !!process.env.SUPABASE_SECRET_KEY?.length,
    hint: "Supabase → API → secret (sb_secret_) — só no servidor",
  },
  {
    key: "DATABASE_URL (opcional para login/seed)",
    ok:
      !process.env.DATABASE_URL?.trim() ||
      (process.env.DATABASE_URL.startsWith("postgresql://") &&
        !process.env.DATABASE_URL.includes("[SENHA]")),
    hint: "Opcional: Session pooler (não use db....direct no Windows)",
  },
  {
    key: "SEED_ADMIN_EMAIL",
    ok: !!process.env.SEED_ADMIN_EMAIL,
    hint: "Você escolhe (ex: admin@luzespe.local)",
  },
  {
    key: "SEED_ADMIN_PASSWORD",
    ok: (process.env.SEED_ADMIN_PASSWORD?.length ?? 0) >= 8,
    hint: "Você escolhe (mínimo 8 caracteres)",
  },
];

console.log("\n=== Luz da Esperança — verificação do .env.local ===\n");

let allOk = true;
for (const { key, ok, hint } of checks) {
  const icon = ok ? "OK" : "FALTA";
  if (!ok) allOk = false;
  console.log(`  [${icon}] ${key}`);
  if (!ok) console.log(`        → ${hint}`);
}

console.log(
  allOk
    ? "\nTudo certo! Rode: npm run db:seed  depois  npm run dev\n"
    : "\nCorrija o .env.local e rode este comando de novo: npm run check:env\n",
);

process.exit(allOk ? 0 : 1);
