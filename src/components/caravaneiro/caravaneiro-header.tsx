import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { APP_NAME } from "@/lib/constants";

export function CaravaneiroHeader({ userName }: { userName: string }) {
  return (
    <header className="blue-gradient sticky top-0 z-40 flex h-14 items-center justify-between gap-3 px-4 text-white shadow-md">
      <div className="flex min-w-0 items-center gap-2">
        <Image
          src="/Logo-Camp.png"
          alt=""
          width={32}
          height={32}
          className="rounded-full ring-2 ring-white/20"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{APP_NAME}</p>
          <p className="truncate text-xs text-white/75">{userName}</p>
        </div>
      </div>
      <LogoutButton variant="header" />
    </header>
  );
}
