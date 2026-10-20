import assert from "node:assert/strict";
import { test } from "node:test";
import { emailSchema } from "./email";

test("o mesmo e-mail com caixa e espaços diferentes identifica o mesmo cadastro", () => {
  assert.equal(emailSchema.parse("  Pessoa@Exemplo.com  "), "pessoa@exemplo.com");
  assert.equal(emailSchema.parse("pessoa@exemplo.com"), "pessoa@exemplo.com");
});

test("e-mails inválidos continuam sendo recusados", () => {
  for (const email of ["", "pessoa", "pessoa @exemplo.com"]) {
    assert.equal(emailSchema.safeParse(email).success, false);
  }
});
