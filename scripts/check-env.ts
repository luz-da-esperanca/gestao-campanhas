/**
 * npm run check:env
 *
 * Duas verificações independentes:
 *
 *   1. VARIÁVEIS — o que está no .env.local basta para o sistema subir?
 *   2. SCHEMA    — o banco apontado é mesmo o banco migrado?
 *
 * A segunda existe porque as variáveis podem estar todas certas e ainda assim
 * apontarem para um projeto Supabase onde ninguém rodou `supabase db push`.
 * Nesse caso o site sobe, a tela de login funciona, e a primeira campanha
 * quebra. Ela só roda quando DATABASE_URL está presente (é uma ferramenta
 * local; em produção essa variável não é usada).
 */

import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

config({ path: resolve(process.cwd(), ".env") });
if (existsSync(resolve(process.cwd(), ".env.local"))) {
  config({ path: resolve(process.cwd(), ".env.local"), override: true });
}

type Estado = "OK" | "FALTA" | "AVISO";
type Item = { chave: string; estado: Estado; dica?: string };

const itens: Item[] = [];
const add = (chave: string, estado: Estado, dica?: string) =>
  itens.push({ chave, estado, dica });

/* ------------------------------------------------------------------ *
 * 1. VARIÁVEIS
 * ------------------------------------------------------------------ */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
if (!url) {
  add("NEXT_PUBLIC_SUPABASE_URL", "FALTA", "Supabase → Settings → API → Project URL");
} else if (!url.includes("supabase.co")) {
  add("NEXT_PUBLIC_SUPABASE_URL", "FALTA", `não parece uma URL do Supabase: ${url}`);
} else if (url.includes("SEU-PROJECT-REF")) {
  add("NEXT_PUBLIC_SUPABASE_URL", "FALTA", "ainda está com o placeholder SEU-PROJECT-REF");
} else {
  add("NEXT_PUBLIC_SUPABASE_URL", "OK");
}

const publica =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (!publica) {
  add("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "FALTA", "Supabase → Connect → publishable (sb_publishable_)");
} else if (publica.endsWith("...")) {
  add("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "FALTA", "é o placeholder do exemplo, não a chave");
} else {
  add("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "OK");
}

const secreta =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SECRET_KEY?.trim();
if (!secreta) {
  add("SUPABASE_SERVICE_ROLE_KEY", "FALTA", "Supabase → API → secret (sb_secret_) — só no servidor");
} else if (secreta.endsWith("...")) {
  add("SUPABASE_SERVICE_ROLE_KEY", "FALTA", "é o placeholder do exemplo, não a chave");
} else if (secreta === publica) {
  add("SUPABASE_SERVICE_ROLE_KEY", "FALTA", "está igual à chave pública — são chaves diferentes");
} else if (secreta.startsWith("sb_publishable_")) {
  add("SUPABASE_SERVICE_ROLE_KEY", "FALTA", "recebeu a publishable key; a secreta começa com sb_secret_");
} else {
  add("SUPABASE_SERVICE_ROLE_KEY", "OK");
}

/*
 * NEXT_PUBLIC_APP_URL tem um fallback silencioso para localhost:3000 em
 * src/lib/constants.ts, e getConsultaUrl() usa esse valor para montar a URL
 * DENTRO DO QR CODE de cada caravaneiro. Sem a variável em produção, os QR
 * codes apontam para localhost e ninguém percebe até tentarem escanear.
 */
const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
if (!appUrl) {
  add("NEXT_PUBLIC_APP_URL", "AVISO", "sem ela, os QR codes apontam para http://localhost:3000 — obrigatória em produção");
} else if (!/^https?:\/\//.test(appUrl)) {
  add("NEXT_PUBLIC_APP_URL", "FALTA", `precisa começar com http:// ou https:// — veio "${appUrl}"`);
} else if (appUrl.startsWith("http://") && !appUrl.includes("localhost")) {
  add("NEXT_PUBLIC_APP_URL", "FALTA", "http:// fora de localhost: a câmera do QR só funciona em https");
} else {
  add("NEXT_PUBLIC_APP_URL", "OK");
}

const dbUrl = process.env.DATABASE_URL?.trim();
if (!dbUrl) {
  add("DATABASE_URL (opcional)", "OK", undefined);
} else if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
  add("DATABASE_URL (opcional)", "FALTA", "precisa começar com postgresql://");
} else if (/\[|\]/.test(dbUrl)) {
  add("DATABASE_URL (opcional)", "FALTA", "ainda tem [YOUR-PASSWORD] ou similar entre colchetes");
} else {
  add("DATABASE_URL (opcional)", "OK");
}

/*
 * O e-mail do admin não é decoração: é o login de produção e o endereço para
 * onde a recuperação de senha é enviada. Um domínio de exemplo aqui significa
 * uma caixa que ninguém abre — e quem perder a senha perde o acesso.
 *
 * Recusar senha placeholder e aprovar e-mail placeholder era meio caminho: a
 * validação de formato abaixo aprovava "admin@exemplo.com" sem reclamar.
 */
// Domínios de documentação. Comparação exata, não por substring: "exemplo.com"
// é placeholder, mas um "meuexemplo.com.br" pode ser o domínio real de alguém.
const DOMINIOS_EXEMPLO = new Set([
  "exemplo.com", "exemplo.com.br", "exemplo.org", "exemplo.net",
  "example.com", "example.net", "example.org", "example.edu",
  "test.com", "teste.com", "dominio.com", "dominio.com.br",
  "meudominio.com", "seudominio.com", "seu-dominio.com",
  "mydomain.com", "yourdomain.com", "acme.com", "foo.com", "bar.com",
]);
// TLDs que nunca entregam e-mail vindo de fora: os reservados pela RFC 2606
// (.test, .example, .invalid, .localhost) e .local, do mDNS. São legítimos em
// desenvolvimento, então viram AVISO e não FALTA — mas em produção significam
// que o "esqueci minha senha" do admin não chega a lugar nenhum.
const TLDS_NAO_ENTREGAVEIS = [".local", ".localhost", ".invalid", ".test", ".example"];

const email = process.env.SEED_ADMIN_EMAIL?.trim();
const dominioEmail = email?.split("@").pop()?.toLowerCase() ?? "";
if (!email) {
  add("SEED_ADMIN_EMAIL", "FALTA", "você escolhe — use um endereço real da instituição");
} else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  add("SEED_ADMIN_EMAIL", "FALTA", `não parece um e-mail: ${email}`);
} else if (DOMINIOS_EXEMPLO.has(dominioEmail)) {
  add("SEED_ADMIN_EMAIL", "FALTA",
    `"${dominioEmail}" é domínio de exemplo — este endereço é o login do admin e o destino da recuperação de senha`);
} else if (TLDS_NAO_ENTREGAVEIS.some((t) => dominioEmail.endsWith(t))) {
  add("SEED_ADMIN_EMAIL", "AVISO",
    `"${dominioEmail}" não recebe e-mail de fora — serve para desenvolvimento, não para produção`);
} else {
  add("SEED_ADMIN_EMAIL", "OK");
}

/*
 * O seed cria um login de administrador de verdade. Uma senha de exemplo que
 * escapa para produção é uma porta aberta com a senha publicada na
 * documentação — por isso estas são recusadas, não apenas avisadas.
 */
// Placeholders que aparecem na documentação: ninguém escolhe uma senha real
// que comece assim.
const PLACEHOLDERS = [
  /^change-?me/i, /^troque/i, /^mudar/i, /^escolha/i, /^sua-senha/i, /^exemplo/i,
];
// Senhas fracas conhecidas, comparadas pela string inteira normalizada. Não
// por prefixo: "Senha@Forte2026" é uma senha legítima e não pode ser recusada
// só por começar com "senha".
const FRACAS = new Set([
  "senha", "senha123", "password", "password123", "admin", "admin123",
  "administrador", "123456", "12345678", "luzespe", "qwerty", "abc123",
]);
const senha = process.env.SEED_ADMIN_PASSWORD ?? "";
if (!senha) {
  add("SEED_ADMIN_PASSWORD", "FALTA", "você escolhe (mínimo 8 caracteres)");
} else if (senha.length < 8) {
  add("SEED_ADMIN_PASSWORD", "FALTA", `tem ${senha.length} caracteres, o mínimo é 8`);
} else if (PLACEHOLDERS.some((r) => r.test(senha))) {
  add("SEED_ADMIN_PASSWORD", "FALTA", "é o placeholder da documentação — escolha uma senha de verdade");
} else if (FRACAS.has(senha.toLowerCase().replace(/[^a-z0-9]/g, ""))) {
  add("SEED_ADMIN_PASSWORD", "FALTA", "é uma das senhas mais testadas em ataque — escolha outra");
} else {
  add("SEED_ADMIN_PASSWORD", "OK");
}

/* ------------------------------------------------------------------ *
 * 2. SCHEMA
 * ------------------------------------------------------------------ */

const TABELAS = [
  "users", "caravaneiros", "campanhas", "rotas", "presencas",
  "arrecadacoes", "item_catalogo", "campanha_participantes",
  "solicitacoes_caravaneiro", "tarefas",
];
const COM_TRIGGER = ["users", "caravaneiros", "campanhas", "rotas", "tarefas"];
const INSTANTES: [string, string][] = [
  ["users", "created_at"], ["users", "updated_at"],
  ["caravaneiros", "created_at"], ["caravaneiros", "updated_at"],
  ["campanhas", "created_at"], ["campanhas", "updated_at"],
  ["rotas", "created_at"], ["rotas", "updated_at"],
  ["tarefas", "created_at"], ["tarefas", "updated_at"],
  ["presencas", "created_at"], ["arrecadacoes", "created_at"],
];
// Datas escolhidas em formulário. Se virarem timestamptz, o dia exibido anda.
const DATAS_ESCOLHIDAS: [string, string][] = [
  ["campanhas", "data_inicio"], ["campanhas", "data_fim"], ["tarefas", "prazo"],
];

const problemasSchema: string[] = [];
let schemaVerificado = false;

async function conferirSchema(conn: string) {
  const pool = new Pool({ connectionString: conn, connectionTimeoutMillis: 15000 });
  try {
    const tabelas = await pool.query<{ relname: string; relrowsecurity: boolean }>(
      `SELECT c.relname, c.relrowsecurity
         FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = ANY($1)`,
      [TABELAS],
    );
    const achadas = new Map(tabelas.rows.map((r) => [r.relname, r.relrowsecurity]));

    for (const t of TABELAS) {
      if (!achadas.has(t)) problemasSchema.push(`tabela ausente: ${t}`);
      else if (!achadas.get(t)) problemasSchema.push(`RLS desligado: ${t}`);
    }

    const trg = await pool.query<{ relname: string }>(
      `SELECT c.relname
         FROM pg_trigger t
         JOIN pg_class c ON c.oid = t.tgrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND t.tgname = 'set_updated_at' AND NOT t.tgisinternal`,
    );
    const comTrigger = new Set(trg.rows.map((r) => r.relname));
    for (const t of COM_TRIGGER) {
      if (!comTrigger.has(t)) problemasSchema.push(`trigger set_updated_at ausente: ${t}`);
    }

    const cols = await pool.query<{ table_name: string; column_name: string; data_type: string }>(
      `SELECT table_name, column_name, data_type
         FROM information_schema.columns
        WHERE table_schema = 'public'`,
    );
    const tipo = new Map(cols.rows.map((r) => [`${r.table_name}.${r.column_name}`, r.data_type]));

    for (const [t, c] of INSTANTES) {
      const d = tipo.get(`${t}.${c}`);
      if (!d) problemasSchema.push(`coluna ausente: ${t}.${c}`);
      else if (d !== "timestamp with time zone")
        problemasSchema.push(`${t}.${c} deveria ser timestamptz, está "${d}" — falta a migration 20260828020000`);
    }
    for (const [t, c] of DATAS_ESCOLHIDAS) {
      const d = tipo.get(`${t}.${c}`);
      if (!d) problemasSchema.push(`coluna ausente: ${t}.${c}`);
      else if (d !== "timestamp without time zone")
        problemasSchema.push(`${t}.${c} NÃO deveria ter fuso, está "${d}" — o dia exibido vai andar`);
    }
    schemaVerificado = true;
  } finally {
    await pool.end();
  }
}

/* ------------------------------------------------------------------ *
 * saída
 * ------------------------------------------------------------------ */

async function main() {
  console.log("\n=== Luz da Esperança — verificação do ambiente ===\n");
  console.log("1) Variáveis\n");

  let falhou = false;
  for (const { chave, estado, dica } of itens) {
    if (estado === "FALTA") falhou = true;
    console.log(`  [${estado.padEnd(5)}] ${chave}`);
    if (dica && estado !== "OK") console.log(`          → ${dica}`);
  }

  console.log("\n2) Schema do banco\n");
  if (!dbUrl) {
    console.log("  [PULADO] DATABASE_URL não definida — não dá para conferir o schema daqui.");
    console.log("           Não é erro: em produção essa variável não é usada.");
  } else {
    try {
      await conferirSchema(dbUrl);
    } catch (e) {
      const msg = (e as Error).message;
      console.log(`  [AVISO] não consegui conectar: ${msg}`);
      // A URL "direct" (db.<ref>.supabase.co) só resolve em IPv6, e boa parte
      // das redes domésticas e do Windows não têm rota IPv6. É a causa mais
      // comum deste erro, e não tem nada a ver com o schema.
      if (/ENETUNREACH|EHOSTUNREACH|ENOTFOUND/.test(msg)) {
        console.log("          Provável causa: DATABASE_URL usa a conexão 'Direct', que é só IPv6.");
        console.log("          Troque para 'Session pooler' em Supabase → Connect.");
      } else if (/password|SASL|authentication/i.test(msg)) {
        console.log("          Senha do banco errada na DATABASE_URL.");
      } else {
        console.log("          Projeto pausado ou URL errada?");
      }
      console.log("          O schema não foi conferido.");
    }

    if (schemaVerificado && problemasSchema.length === 0) {
      console.log(`  [OK   ] 10 tabelas, RLS em todas, 5 triggers, ${INSTANTES.length} colunas timestamptz`);
    } else if (schemaVerificado) {
      falhou = true;
      console.log(`  [FALTA] ${problemasSchema.length} problema(s):\n`);
      for (const p of problemasSchema) console.log(`          - ${p}`);
      console.log("\n          Aplique as migrations: supabase db push");
    }
  }

  console.log(
    falhou
      ? "\nCorrija os itens acima e rode de novo: npm run check:env\n"
      : "\nTudo certo! Rode: npm run db:seed  depois  npm run dev\n",
  );
  process.exit(falhou ? 1 : 0);
}

void main();
