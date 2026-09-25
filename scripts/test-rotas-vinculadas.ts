/** Testa a migration e os vínculos em uma transação sempre revertida. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { Client } from "pg";

config({ path: [".env.local", ".env"], quiet: true });
const db = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
const migration = readFileSync(new URL("../supabase/migrations/20260925000000_rotas_coleta_vinculadas.sql", import.meta.url), "utf8");

async function campanha(tipo: string, origem: string | null = null) {
  const { rows } = await db.query(
    "INSERT INTO public.campanhas (nome, tipo, distribuicao_id) VALUES ('Teste transacional de rotas', $1, $2) RETURNING id",
    [tipo, origem],
  );
  return rows[0].id as string;
}

async function rotas(id: string) {
  const { rows } = await db.query(
    `SELECT r.* FROM public.rotas r JOIN public.campanhas c ON
       r.campanha_id = CASE WHEN c.distribuicao_id IS NOT NULL AND NOT c.rotas_personalizadas
       THEN c.distribuicao_id ELSE c.id END WHERE c.id = $1 ORDER BY r.nome`,
    [id],
  );
  return rows;
}

async function rejeita(sql: string, params: unknown[], message: RegExp) {
  await db.query("SAVEPOINT rejeicao");
  try {
    await assert.rejects(() => db.query(sql, params), message);
  } finally {
    await db.query("ROLLBACK TO SAVEPOINT rejeicao");
    await db.query("RELEASE SAVEPOINT rejeicao");
  }
}

async function main() {
  await db.connect();
  try {
    await db.query("BEGIN");
    await db.query("SET LOCAL lock_timeout = '5s'");
    await db.query("SET LOCAL statement_timeout = '20s'");
    await db.query(migration);
    await db.query(migration); // Reaplicar não altera dados nem duplica triggers.
    const origem = await campanha("DISTRIBUICAO");
    const coleta = await campanha("COLETA", origem);
    const outraColeta = await campanha("COLETA", origem);
    assert.equal((await rotas(coleta)).length, 0);

    const path = JSON.stringify([{ lat: -5.09, lng: -42.8 }, { lat: -5.08, lng: -42.81 }]);
    const { rows: [rota] } = await db.query(
      "INSERT INTO public.rotas (campanha_id,nome,path,bairro,responsavel) VALUES ($1,'Rota A',$2,'Centro','Equipe') RETURNING id",
      [origem, path],
    );
    assert.equal((await rotas(coleta))[0].id, rota.id);
    assert.equal((await rotas(outraColeta))[0].id, rota.id);
    await db.query("UPDATE public.rotas SET nome = 'Rota atualizada' WHERE id = $1", [rota.id]);
    assert.equal((await rotas(coleta))[0].nome, "Rota atualizada");
    console.log("OK: rotas criadas e alteradas depois do agendamento são herdadas.");

    await rejeita("INSERT INTO public.rotas (campanha_id,nome) VALUES ($1,'Indevida')", [coleta], /Personalize/);
    await rejeita("INSERT INTO public.campanhas (nome,tipo,distribuicao_id) VALUES ('Inválida','ESPECIAL',$1)", [origem], /Somente uma coleta/);
    await rejeita("INSERT INTO public.campanhas (nome,tipo,distribuicao_id) VALUES ('Inválida','COLETA',$1)", [coleta], /distribuição não encontrada/);
    const { rows: permissions } = await db.query(`SELECT
      has_function_privilege('anon', 'public.personalizar_rotas_coleta(uuid)', 'EXECUTE') AS anon,
      has_function_privilege('authenticated', 'public.personalizar_rotas_coleta(uuid)', 'EXECUTE') AS authenticated,
      has_function_privilege('service_role', 'public.personalizar_rotas_coleta(uuid)', 'EXECUTE') AS service`);
    assert.deepEqual(permissions[0], { anon: false, authenticated: false, service: true });
    console.log("OK: vínculos inválidos, gravação em rotas herdadas e acesso público à RPC são bloqueados.");

    await db.query("SELECT public.personalizar_rotas_coleta($1)", [coleta]);
    await db.query("SELECT public.personalizar_rotas_coleta($1)", [coleta]);
    const copias = await rotas(coleta);
    assert.equal(copias.length, 1);
    assert.notEqual(copias[0].id, rota.id);
    assert.equal(copias[0].bairro, "Centro");
    assert.equal(copias[0].responsavel, "Equipe");
    assert.deepEqual(copias[0].path, JSON.parse(path));
    await db.query("UPDATE public.rotas SET nome = 'Só coleta' WHERE id = $1", [copias[0].id]);
    assert.equal((await rotas(origem))[0].nome, "Rota atualizada");
    await db.query("DELETE FROM public.rotas WHERE id = $1", [rota.id]);
    assert.equal((await rotas(outraColeta)).length, 0);
    assert.equal((await rotas(coleta))[0].nome, "Só coleta");
    await db.query("DELETE FROM public.rotas WHERE id = $1", [copias[0].id]);
    await db.query("SELECT public.personalizar_rotas_coleta($1)", [coleta]);
    assert.equal((await rotas(coleta)).length, 0);
    console.log("OK: personalização copia os dados uma vez e isola mudanças e exclusões.");

    await db.query("SELECT public.personalizar_rotas_coleta($1)", [outraColeta]);
    await db.query("INSERT INTO public.rotas (campanha_id,nome,path) VALUES ($1,'Rota futura',$2)", [origem, path]);
    assert.equal((await rotas(outraColeta)).length, 0);
    console.log("OK: personalizar uma coleta vazia também encerra a sincronização.");
  } finally {
    await db.query("ROLLBACK");
    await db.end();
  }
  console.log("Todos os testes passaram. Nenhum registro de teste foi persistido.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Falha nos testes de rotas");
  process.exitCode = 1;
});
