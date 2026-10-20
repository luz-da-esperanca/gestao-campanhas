// Integração: migrations reais executadas em PostgreSQL local em memória (PGlite).
// Não acessa Supabase Auth nem bancos configurados em variáveis de ambiente.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migrationsDir = new URL("../../../supabase/migrations/", import.meta.url);
const migration = readFileSync(new URL("20261019000000_cadastros_unicos_por_email.sql", migrationsDir), "utf8");

test("cadastros e solicitações são únicos por e-mail, preservando o histórico", async (t) => {
  const db = new PGlite();
  const solicitar = (email: string, status = "PENDENTE") => db.query(
    "INSERT INTO solicitacoes_caravaneiro (nome, email, status) VALUES ('Pessoa', $1, $2)",
    [email, status],
  );
  const criarUsuario = async (email: string) => {
    const { rows } = await db.query<{ id: string }>(
      "INSERT INTO users (id, email, name, role) VALUES (gen_random_uuid(), $1, 'Pessoa', 'caravaneiro') RETURNING id",
      [email],
    );
    return rows[0].id;
  };
  const criarCaravaneiro = (email: string | null, userId: string | null = null) => db.query(
    "INSERT INTO caravaneiros (nome, email, user_id, public_id) VALUES ('Pessoa', $1, $2, gen_random_uuid()::text)",
    [email, userId],
  );
  const rejeitaDuplicado = (operation: Promise<unknown>) => assert.rejects(operation, { code: "23505" });

  try {
    for (const file of ["20260526150000_init.sql", "20260603000000_guest_solicitacoes.sql"]) {
      await db.exec(readFileSync(new URL(file, migrationsDir), "utf8"));
    }
    await solicitar(" Historico@Exemplo.com ");
    await solicitar("historico@exemplo.com", "RECUSADA");
    await criarUsuario(" Antigo@Exemplo.com ");
    await criarCaravaneiro(" Legado@Exemplo.com ");

    await t.test("aplicar e reaplicar a migration não remove nem reescreve cadastros antigos", async () => {
      await db.exec(migration);
      await db.exec(migration);
      const { rows } = await db.query<{ email: string }>(
        "SELECT email FROM solicitacoes_caravaneiro ORDER BY email",
      );
      assert.deepEqual(rows.map((row) => row.email), [" Historico@Exemplo.com ", "historico@exemplo.com"]);
      await rejeitaDuplicado(solicitar("HISTORICO@exemplo.com"));
      await rejeitaDuplicado(criarUsuario("antigo@exemplo.com"));
      await rejeitaDuplicado(criarCaravaneiro("legado@exemplo.com"));
    });

    for (const status of ["PENDENTE", "APROVADA", "RECUSADA"]) {
      await t.test(`uma solicitação ${status} impede outra com o mesmo e-mail`, async () => {
        const email = `${status.toLowerCase()}@exemplo.com`;
        await solicitar(email, status);
        await rejeitaDuplicado(solicitar(`  ${email.toUpperCase()}  `));
      });
    }

    await t.test("usuários e caravaneiros existentes não podem solicitar novamente", async () => {
      await criarUsuario("cadastrado@exemplo.com");
      await rejeitaDuplicado(solicitar(" CADASTRADO@exemplo.com "));
      await criarCaravaneiro("sem-login@exemplo.com");
      await rejeitaDuplicado(solicitar("SEM-LOGIN@EXEMPLO.COM"));
    });

    await t.test("aprovar uma solicitação permite criar o usuário e seu caravaneiro uma única vez", async () => {
      await solicitar("aprovacao@exemplo.com");
      const userId = await criarUsuario(" Aprovacao@Exemplo.com ");
      await criarCaravaneiro("APROVACAO@exemplo.com", userId);
      await db.query("UPDATE solicitacoes_caravaneiro SET status = 'APROVADA' WHERE email = $1", ["aprovacao@exemplo.com"]);
      await rejeitaDuplicado(criarUsuario("aprovacao@exemplo.com"));
      await rejeitaDuplicado(criarCaravaneiro("aprovacao@exemplo.com", userId));
      await rejeitaDuplicado(solicitar("aprovacao@exemplo.com"));
      const { rows } = await db.query<{ email: string }>("SELECT email FROM users WHERE id = $1", [userId]);
      assert.equal(rows[0].email, "aprovacao@exemplo.com");
    });

    await t.test("um e-mail não pode pertencer a cadastros de pessoas diferentes", async () => {
      await criarUsuario("ocupado@exemplo.com");
      await rejeitaDuplicado(criarCaravaneiro("ocupado@exemplo.com"));
      await criarCaravaneiro("avulso@exemplo.com");
      await rejeitaDuplicado(criarUsuario("avulso@exemplo.com"));
    });

    await t.test("alterar o e-mail também respeita a unicidade e permite manter o próprio e-mail", async () => {
      const primeiro = await criarUsuario("primeiro@exemplo.com");
      const segundo = await criarUsuario("segundo@exemplo.com");
      await db.query("UPDATE users SET email = ' PRIMEIRO@EXEMPLO.COM ' WHERE id = $1", [primeiro]);
      await rejeitaDuplicado(db.query("UPDATE users SET email = 'primeiro@exemplo.com' WHERE id = $1", [segundo]));
      await criarCaravaneiro("primeiro@exemplo.com", primeiro);
      await rejeitaDuplicado(db.query("UPDATE caravaneiros SET user_id = $1 WHERE user_id = $2", [segundo, primeiro]));
      await solicitar("outra-solicitacao@exemplo.com");
      await rejeitaDuplicado(db.query("UPDATE solicitacoes_caravaneiro SET email = 'primeiro@exemplo.com' WHERE email = 'outra-solicitacao@exemplo.com'"));
    });

    await t.test("pessoas com o mesmo nome e e-mails distintos continuam permitidas", async () => {
      await criarUsuario("homonimo1@exemplo.com");
      await criarUsuario("homonimo2@exemplo.com");
      await criarCaravaneiro(null);
      await criarCaravaneiro(null);
    });

    await t.test("duas submissões do mesmo e-mail persistem uma única solicitação", async () => {
      const resultados = await Promise.allSettled([
        solicitar("duplo@exemplo.com"),
        solicitar(" DUPLO@EXEMPLO.COM "),
      ]);
      assert.equal(resultados.filter((resultado) => resultado.status === "fulfilled").length, 1);
      const { rows } = await db.query<{ total: number }>(
        "SELECT count(*)::int AS total FROM solicitacoes_caravaneiro WHERE email = 'duplo@exemplo.com'",
      );
      assert.equal(rows[0].total, 1);
    });
  } finally {
    await db.close();
  }
});
