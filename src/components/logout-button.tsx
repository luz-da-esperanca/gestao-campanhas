"use client";

import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

type LogoutButtonProps = {
  className?: string;
  variant?: "default" | "sidebar" | "header" | "light";
};

export function LogoutButton({
  className,
  variant = "default",
}: LogoutButtonProps) {
  return (
    <form action={logoutAction} className={variant === "sidebar" ? "w-full" : undefined}>
      <Button
        type="submit"
        variant={variant === "default" ? "ghost" : "outline"}
        size="sm"
        className={cn(
          variant === "sidebar" &&
            "h-10 w-full justify-center gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
          variant === "header" &&
            "gap-2 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
          variant === "light" &&
            "gap-2 border-slate-200 bg-slate-50 text-[#0d47a1] hover:bg-slate-100",
          className,
        )}
      >
        <LogOut className="size-4" />
        Sair
      </Button>
    </form>
  );
}
