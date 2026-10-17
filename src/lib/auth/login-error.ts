import type { AuthError } from "@supabase/supabase-js";

export function getLoginErrorMessage(error: Pick<AuthError, "code" | "status">): string {
  if (error.code === "invalid_credentials") {
    return "E-mail ou senha incorretos";
  }

  if (error.code === "email_not_confirmed") {
    return "Confirme seu e-mail antes de entrar.";
  }

  if (error.status === 429) {
    return "Muitas tentativas de login. Aguarde alguns instantes e tente novamente.";
  }

  return "Não foi possível acessar o serviço de login. Tente novamente em instantes.";
}
