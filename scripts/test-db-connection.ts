import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

config({ path: resolve(process.cwd(), ".env") });
if (existsSync(resolve(process.cwd(), ".env.local"))) {
  config({ path: resolve(process.cwd(), ".env.local"), override: true });
}

const url = process.env.DATABASE_URL;

if (!url) {
  console.log("DATABASE_URL não definida.");
  process.exit(1);
}

console.log("Testando:", url.replace(/:([^:@]+)@/, ":***@"));

const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 15000 });

pool
  .query("SELECT 1")
  .then(() => {
    console.log("✓ Conexão Postgres OK — o app admin deve funcionar.");
    process.exit(0);
  })
  .catch((e) => {
    console.error("✗ Falhou:", e.message);
    console.log(`
Dica: a URL direct (db....supabase.co) usa só IPv6 e costuma falhar no Windows.

No Supabase → Connect → Direct connection string:
  • Mude para "Session pooler" (não "Direct")
  • Copie a URI com postgres.clgvsxgbivqgmvmehegm no usuário
  • Cole em DATABASE_URL no .env.local

O npm run db:seed NÃO precisa mais de DATABASE_URL (usa API).
`);
    process.exit(1);
  })
  .finally(() => pool.end());
