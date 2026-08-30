import Link from "next/link";
import Image from "next/image";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { LayoutDashboard, LogIn, Megaphone, UserPlus } from "lucide-react";

export async function PublicShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const user = await getSessionUser();
  const panelHref =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "caravaneiro"
        ? "/app"
        : null;

  return (
    <div className="min-h-dvh soft-page">
      <header className="blue-gradient relative z-10 shadow-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/campanhas" className="flex min-w-0 items-center gap-2">
            <Image
              src="/Logo-Camp.png"
              alt=""
              width={32}
              height={32}
              className="rounded-lg ring-2 ring-white/20"
            />
            <div className="min-w-0">
              <span className="block truncate text-sm font-semibold text-white">
                {APP_NAME}
              </span>
              <span className="hidden truncate text-xs text-white/70 sm:block">
                {APP_TAGLINE}
              </span>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/90 hover:bg-white/10 hover:text-white"
              render={<Link href="/campanhas" prefetch scroll={false} />}
            >
              <Megaphone className="size-4" />
              <span className="hidden sm:inline">Campanhas</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/90 hover:bg-white/10 hover:text-white"
              render={<Link href="/participar" prefetch scroll={false} />}
            >
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Participar</span>
            </Button>
            {panelHref ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-2 bg-white text-primary hover:bg-white/90"
                  render={<Link href={panelHref} prefetch scroll={false} />}
                >
                  <LayoutDashboard className="size-4" />
                  <span className="hidden sm:inline">Painel</span>
                </Button>
                <LogoutButton variant="header" />
              </>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="gap-2 bg-white text-primary hover:bg-white/90"
                render={<Link href="/login" prefetch scroll={false} />}
              >
                <LogIn className="size-4" />
                Entrar
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-6 md:py-8">
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-[#0d47a1] md:text-3xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-sm text-muted-foreground md:text-base">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="glass-card rounded-2xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
