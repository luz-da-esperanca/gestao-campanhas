"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Megaphone, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/app/qr", label: "QR", icon: QrCode },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg rounded-t-3xl border border-blue-100 bg-white px-2 py-3 shadow-[0_-12px_35px_rgba(13,71,161,.12)]">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              prefetch
              scroll={false}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 text-xs font-medium",
                active ? "text-[#0d47a1]" : "text-slate-500",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
