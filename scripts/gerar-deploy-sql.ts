/**
 * Gera (ou verifica) supabase/deploy-producao.sql a partir de supabase/migrations/.
 *
 *   npm run db:deploy-sql            regera o arquivo
 *   npm run db:deploy-sql -- --check só verifica; sai com código 1 se desatualizado
 *
 * O SQL das migrations NUNCA é alterado — cada bloco só recebe um cabeçalho de
 * origem com o sha256 do arquivo de onde veio.
 */

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR_MIGRATIONS = join(RAIZ, "supabase", "migrations");
const ARQUIVO_SAIDA = join(RAIZ, "supabase", "deploy-producao.sql");
const CAMINHO_RELATIVO_SAIDA = "supabase/deploy-producao.sql";

/**
 * Migrations que NÃO podem ser reexecutadas, com o motivo técnico.
 * Ao adicionar uma migration nova, só entre aqui se ela realmente não for
 * idempotente — o cabeçalho gerado promete que as demais são seguras de repetir.
 */
const NAO_IDEMPOTENTES: Record<string, string> = {
  "20260526150000_init.sql":
    "CREATE TYPE / CREATE TABLE / CREATE INDEX sem guarda — falha já no 1o comando",
  "20260526160000_rls.sql":
    "CREATE POLICY sem guarda (Postgres não suporta IF NOT EXISTS para políticas)",
  "20260604000000_presenca.sql":
    "o handler é 'duplicate_object', mas ADD CONSTRAINT UNIQUE levanta 42P07 'duplicate_table'",
};

function sha256(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

function listarMigrations(): string[] {
  return readdirSync(DIR_MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

function montarConteudo(arquivos: string[]): string {
  const listaNaoIdem = arquivos
    .filter((n) => n in NAO_IDEMPOTENTES)
    .map((n) => `--    * ${n}\n--        ${NAO_IDEMPOTENTES[n]}\n`)
    .join("");

  const indice = arquivos
    .map((n, i) => {
      const marca = n in NAO_IDEMPOTENTES ? "  (NÃO idempotente)" : "";
      return `--   ${String(i + 1).padStart(2)}. ${n}${marca}\n`;
    })
    .join("");

  const partes: string[] = [];

  partes.push(`-- =============================================================================
--  Luz da Esperança — deploy do banco  (MÉTODO ALTERNATIVO)
-- =============================================================================
--
--  >>> ESTE NÃO É O MÉTODO PREFERENCIAL. <<<
--
--  O jeito recomendado de aplicar o schema é o Supabase CLI:
--
--      supabase link --project-ref SEU-PROJECT-REF
--      supabase db push
--
--  O CLI aplica as migrations na ordem, registra quais já foram aplicadas na
--  tabela de controle do Supabase e é seguro de repetir. Use este arquivo
--  SOMENTE se o CLI não funcionar na sua máquina.
--
-- -----------------------------------------------------------------------------
--  COMO USAR ESTE ARQUIVO
-- -----------------------------------------------------------------------------
--  1. Abra o SQL Editor do seu projeto:
--       https://supabase.com/dashboard/project/SEU-PROJECT-REF/sql/new
--  2. Copie este arquivo INTEIRO e cole no editor.
--  3. Clique em Run. Deve aparecer "Success".
--
--  Este arquivo é a concatenação literal de supabase/migrations/, na ordem dos
--  nomes. O SQL não foi alterado — cada bloco traz um comentário indicando o
--  arquivo de origem. A fonte de verdade continua sendo supabase/migrations/.
--
-- -----------------------------------------------------------------------------
--  ⚠️  ARQUIVO GERADO — NÃO EDITE À MÃO
-- -----------------------------------------------------------------------------
--  Qualquer alteração feita aqui é perdida na próxima geração. Para mudar o
--  SQL, edite a migration correspondente em supabase/migrations/ e regere:
--
--      npm run db:deploy-sql
--
--  Criou uma migration nova? Este arquivo fica DESATUALIZADO até ser regerado.
--  Para conferir sem reescrever nada (útil em CI ou antes de um deploy):
--
--      npm run db:deploy-sql -- --check
--
--  O modo --check recalcula o sha256 de cada migration, compara com os hashes
--  registrados nos blocos abaixo e sai com código 1 se algo divergir —
--  migration adicionada, removida ou editada.
--
-- -----------------------------------------------------------------------------
--  ⚠️  ATENÇÃO: ESTE SCRIPT NÃO PODE SER RODADO DUAS VEZES
-- -----------------------------------------------------------------------------
--  Três migrations antigas não são idempotentes (foram deliberadamente NÃO
--  corrigidas, porque já estão aplicadas no projeto de desenvolvimento e
--  editá-las dessincronizaria o histórico do supabase db push):
--
${listaNaoIdem}--
--  Consequência prática: se a execução falhar no meio, NÃO basta colar o
--  arquivo de novo — os comandos já executados vão dar erro de "already
--  exists" e mascarar o problema real. Nesse caso:
--
--    a) Anote a mensagem de erro e em qual bloco ela ocorreu.
--    b) Se o banco estiver VAZIO e for possível: apague o schema public
--       (DROP SCHEMA public CASCADE; CREATE SCHEMA public;) e recomece do zero.
--       ATENÇÃO: isso apaga TODOS os dados. Só faça em banco novo.
--    c) Se houver dados: rode manualmente só os blocos que ainda faltam,
--       a partir do arquivo de origem indicado no comentário de cada bloco.
--
--  As migrations de 20260828 em diante SÃO idempotentes e podem ser
--  reexecutadas isoladamente sem risco.
--
-- -----------------------------------------------------------------------------
--  CONTEÚDO (${arquivos.length} arquivos, na ordem de aplicação)
-- -----------------------------------------------------------------------------
${indice}--
--  Gerado por scripts/gerar-deploy-sql.ts a partir de supabase/migrations/.
-- =============================================================================


`);

  arquivos.forEach((nome, i) => {
    const conteudo = readFileSync(join(DIR_MIGRATIONS, nome), "utf8");
    const hash = sha256(conteudo).slice(0, 12);
    const idem =
      nome in NAO_IDEMPOTENTES
        ? "NÃO idempotente — ver aviso no topo"
        : "idempotente";

    partes.push(
      `\n\n-- =============================================================================
-- BLOCO ${i + 1}/${arquivos.length}
-- ORIGEM: supabase/migrations/${nome}
-- sha256(12): ${hash}   |   ${idem}
-- =============================================================================\n\n` +
        conteudo.replace(/\n+$/, "") +
        "\n",
    );
  });

  partes.push(
    `\n\n-- =============================================================================
-- FIM — ${arquivos.length} blocos aplicados.
-- Confira no painel: Table Editor deve listar 10 tabelas, e
-- Authentication > Policies deve mostrar RLS habilitado em todas elas.
-- =============================================================================\n`,
  );

  return partes.join("");
}

/** Hashes registrados nos blocos do arquivo atual, na ordem em que aparecem. */
function lerBlocosRegistrados(texto: string): Array<{ nome: string; hash: string }> {
  const re =
    /-- ORIGEM: supabase\/migrations\/(\S+)\n-- sha256\(12\): ([0-9a-f]{12})/g;
  const achados: Array<{ nome: string; hash: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto)) !== null) {
    achados.push({ nome: m[1], hash: m[2] });
  }
  return achados;
}

function verificar(arquivos: string[]): number {
  if (!existsSync(ARQUIVO_SAIDA)) {
    console.error(`[FALHA] ${CAMINHO_RELATIVO_SAIDA} não existe.`);
    console.error("        Rode: npm run db:deploy-sql");
    return 1;
  }

  const atual = readFileSync(ARQUIVO_SAIDA, "utf8");
  const esperado = montarConteudo(arquivos);

  if (atual === esperado) {
    console.log(
      `[OK] ${CAMINHO_RELATIVO_SAIDA} está em sincronia com as ${arquivos.length} migrations.`,
    );
    return 0;
  }

  // Diagnóstico específico, para não obrigar a comparar 500+ linhas na mão.
  console.error(`[FALHA] ${CAMINHO_RELATIVO_SAIDA} está DESATUALIZADO.\n`);

  const registrados = lerBlocosRegistrados(atual);
  const registradosPorNome = new Map(registrados.map((b) => [b.nome, b.hash]));
  const atuaisPorNome = new Map(
    arquivos.map((n) => [
      n,
      sha256(readFileSync(join(DIR_MIGRATIONS, n), "utf8")).slice(0, 12),
    ]),
  );

  for (const nome of arquivos) {
    const noArquivo = registradosPorNome.get(nome);
    const real = atuaisPorNome.get(nome)!;
    if (!noArquivo) {
      console.error(`  + migration NOVA, ausente do deploy: ${nome}`);
    } else if (noArquivo !== real) {
      console.error(`  ~ migration ALTERADA: ${nome}  (${noArquivo} -> ${real})`);
    }
  }
  for (const { nome } of registrados) {
    if (!atuaisPorNome.has(nome)) {
      console.error(`  - migration REMOVIDA, ainda no deploy: ${nome}`);
    }
  }

  const soOrdemOuCabecalho =
    registrados.length === arquivos.length &&
    registrados.every((b, i) => b.nome === arquivos[i] && b.hash === atuaisPorNome.get(b.nome));
  if (soOrdemOuCabecalho) {
    console.error("  ~ as migrations não mudaram, mas o conteúdo do arquivo");
    console.error("    diverge do que seria gerado agora. Causas possíveis:");
    console.error("      - o arquivo foi editado à mão (inclusive o SQL dos blocos)");
    console.error("      - o gerador mudou desde a última geração");
  }

  console.error("\n  Para corrigir: npm run db:deploy-sql");
  return 1;
}

function main(): void {
  const arquivos = listarMigrations();

  if (arquivos.length === 0) {
    console.error(`[FALHA] nenhuma migration encontrada em ${DIR_MIGRATIONS}`);
    process.exit(1);
  }

  const modoCheck = process.argv.slice(2).includes("--check");

  if (modoCheck) {
    process.exit(verificar(arquivos));
  }

  writeFileSync(ARQUIVO_SAIDA, montarConteudo(arquivos), "utf8");
  console.log(
    `[OK] ${CAMINHO_RELATIVO_SAIDA} gerado a partir de ${arquivos.length} migrations:`,
  );
  arquivos.forEach((n, i) => console.log(`     ${String(i + 1).padStart(2)}. ${n}`));
}

main();
