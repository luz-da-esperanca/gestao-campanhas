import assert from "node:assert/strict";
import { test } from "node:test";
import { proximoDomingo } from "./proximo-domingo";

test("distribuição no domingo sugere o domingo da semana seguinte", () => {
  assert.equal(proximoDomingo("2026-09-27"), "2026-10-04");
});

test("distribuição em outro dia sugere o primeiro domingo posterior", () => {
  assert.equal(proximoDomingo("2026-09-24"), "2026-09-27");
  assert.equal(proximoDomingo("2026-09-26"), "2026-09-27");
});

test("trata virada de ano e ano bissexto", () => {
  assert.equal(proximoDomingo("2023-12-31"), "2024-01-07");
  assert.equal(proximoDomingo("2024-02-25"), "2024-03-03");
});

test("aceita a data sem fuso retornada pelo banco", () => {
  assert.equal(proximoDomingo("2026-09-27T00:00:00"), "2026-10-04");
});

test("não inventa sugestão para data ausente ou inválida", () => {
  for (const data of [null, "", "invalida", "2026-02-30", "2026-13-01"]) {
    assert.equal(proximoDomingo(data), "");
  }
});
