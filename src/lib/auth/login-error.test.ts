import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { getLoginErrorMessage } from "./login-error";

test("credenciais inválidas continuam mostrando o erro de e-mail ou senha", () => {
  const error = new AuthApiError("Invalid login credentials", 400, "invalid_credentials");
  assert.equal(getLoginErrorMessage(error), "E-mail ou senha incorretos");
});

test("falhas de conexão e do serviço não são apresentadas como senha incorreta", () => {
  const errors = [
    new AuthRetryableFetchError("fetch failed", 0),
    new AuthRetryableFetchError("Service unavailable", 503),
    new AuthApiError("Internal server details", 500, "unexpected_failure"),
    new AuthApiError("Invalid API key", 401, undefined),
  ];
  for (const error of errors) {
    const message = getLoginErrorMessage(error);
    assert.match(message, /serviço de login/);
    assert.doesNotMatch(message, /senha incorreta|fetch failed|Internal server details|API key/);
  }
});

test("limite de tentativas orienta a aguardar", () => {
  const error = new AuthApiError("Rate limit exceeded", 429, "over_request_rate_limit");
  assert.match(getLoginErrorMessage(error), /Aguarde/);
});

test("e-mail sem confirmação orienta a confirmar a conta", () => {
  const error = new AuthApiError("Email not confirmed", 400, "email_not_confirmed");
  assert.equal(getLoginErrorMessage(error), "Confirme seu e-mail antes de entrar.");
});
