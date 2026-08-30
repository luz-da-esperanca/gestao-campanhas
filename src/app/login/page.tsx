import Image from "next/image";
import { LoginForm } from "@/components/login-form";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

type LoginPageProps = {
  searchParams: Promise<{ redirect?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-white">
      <div
        className="absolute inset-y-0 right-0 hidden w-[34%] blue-gradient lg:block"
        style={{ clipPath: "ellipse(70% 85% at 100% 50%)" }}
      />
      <div className="absolute left-0 top-0 hidden h-80 w-80 rounded-br-[120px] bg-[#e3f2fd] lg:block" />

      <section className="relative z-10 grid min-h-dvh place-items-center p-6">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_430px]">
          <div className="hidden rounded-[32px] blue-gradient p-10 text-white shadow-2xl lg:block">
            <div className="relative mx-auto mb-8 h-40 w-40 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/15">
              <Image
                src="/Logo-Camp.png"
                alt={APP_NAME}
                fill
                priority
                sizes="150px"
                className="scale-105 object-cover"
              />
            </div>
            <h1 className="text-center text-3xl font-bold leading-tight">
              {APP_NAME}
            </h1>
            <p className="mt-5 text-center text-base text-white/90">
              {APP_TAGLINE}
            </p>
            <div className="mt-8 text-center text-4xl">💙</div>
          </div>

          <LoginForm
            redirect={params.redirect}
            errorParam={params.error}
          />
        </div>
      </section>
    </main>
  );
}
