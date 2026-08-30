"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  Gift,
  Home,
  MapPin,
  Megaphone,
  Menu,
  Settings,
  ShieldCheck,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutButton } from "@/components/logout-button";
import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/admin/solicitacoes", label: "Solicitações", icon: UserPlus },
  { href: "/admin/caravaneiros", label: "Caravaneiros", icon: Users },
  { href: "/admin/admins", label: "Administradores", icon: ShieldCheck },
  { href: "/admin/tarefas", label: "Tarefas", icon: ClipboardCheck },
  { href: "/admin/doacoes", label: "Doações", icon: Gift },
  { href: "/admin/rotas", label: "Rotas", icon: MapPin },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function NavLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {links.map(({ href, label, icon: Icon }, index) => {
        const active =
          index === 0
            ? pathname === "/admin"
            : pathname.startsWith(href) && href !== "/admin";

        return (
          <Link
            key={`${label}-${href}`}
            href={href}
            prefetch
            scroll={false}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              active
                ? "bg-[#1976d2] text-white shadow-lg shadow-blue-950/20"
                : "text-white/85 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar({ userName }: { userName?: string }) {
  const displayName = userName ?? "Administrador";

  return (
    <>
      <aside className="blue-gradient hidden w-72 shrink-0 p-5 text-white md:flex md:flex-col">
        <div className="mb-8 flex flex-col items-center gap-3 pt-2 text-center">
          <Image
            src="/Logo-Camp.png"
            alt="Logo"
            width={110}
            height={110}
            sizes="110px"
            priority
            className="rounded-full object-cover shadow-xl ring-2 ring-white/20"
          />
          <span className="text-sm font-semibold leading-tight">
            {APP_NAME}
          </span>
        </div>

        <NavLinks />

        <div className="mt-auto rounded-2xl bg-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 text-sm">
            <div className="grid size-10 place-items-center rounded-full bg-white text-[#0d47a1]">
              <UserCircle className="size-6" />
            </div>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-white/70">Administrador</p>
            </div>
          </div>
          <LogoutButton variant="sidebar" />
        </div>
      </aside>

      <header className="flex h-16 items-center justify-between gap-2 border-b bg-white px-4 md:hidden">
        <Image
          src="/Logo-Camp.png"
          alt="Logo"
          width={42}
          height={42}
          sizes="42px"
          priority
          className="rounded-full object-cover ring-1 ring-blue-100"
        />
        <div className="flex items-center gap-2">
          <LogoutButton variant="light" className="hidden sm:flex" />
          <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="blue-gradient w-80 text-white">
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-6">
              <NavLinks />
              <LogoutButton variant="sidebar" />
            </div>
          </SheetContent>
        </Sheet>
        </div>
      </header>
    </>
  );
}
