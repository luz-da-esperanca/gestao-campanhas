"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { Eye, Lock, Mail } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { APP_NAME } from "@/lib/constants";

type LoginFormProps = { redirect?: string; errorParam?: string };

export function LoginForm({ redirect, errorParam }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      (await loginAction(formData)) ?? null,
    null,
  );

  const inactiveError =
    errorParam === "conta_inativa"
      ? "Conta inativa. Fale com a administração."
      : null;
  const configError =
    errorParam === "config"
      ? "Supabase não configurado. Preencha o .env.local e reinicie o servidor."
      : null;
  const setupMode = errorParam === "config";

  return (
    <div className="mx-auto w-full max-w-[430px] rounded-[28px] border border-blue-100 bg-white/95 p-8 shadow-[0_24px_80px_rgba(13,71,161,.16)] backdrop-blur">
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full shadow-lg ring-8 ring-[#e3f2fd]">
          <Image
            src="/Logo-Camp.png"
            alt={APP_NAME}
            fill
            priority
            sizes="144px"
            className="scale-105 object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-[#0d47a1]">
          Bem-vindo de volta! 👋
        </h1>
        <p className="mt-2 text-sm text-[#263238]/70">
          Faça login para continuar
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {redirect && <input type="hidden" name="redirect" value={redirect} />}
        {(state?.error || inactiveError || configError) && (
          <Alert variant={configError ? "default" : "destructive"}>
            <AlertDescription>
              {state?.error ?? inactiveError ?? configError}
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0d47a1]/60" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="E-mail"
            className="h-12 rounded-xl border-blue-100 bg-white pl-11"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#0d47a1]/60" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            placeholder="Senha"
            className="h-12 rounded-xl border-blue-100 bg-white pl-11 pr-11"
          />
          <Eye className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={pending || setupMode}
          className="blue-gradient h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-blue-200"
        >
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-xs text-slate-500">
        <p>
          <Link href="/campanhas" className="font-medium text-[#0d47a1] underline">
            Ver campanhas e rotas
          </Link>
          {" "}sem precisar de conta.
        </p>
        <p>
          Quer ajudar?{" "}
          <Link href="/participar" className="font-medium text-[#0d47a1] underline">
            Solicite ser caravaneiro
          </Link>
        </p>
      </div>
    </div>
  );
}
