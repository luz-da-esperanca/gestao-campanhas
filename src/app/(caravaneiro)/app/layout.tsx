import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { BottomNav } from "@/components/caravaneiro/bottom-nav";
import { CaravaneiroHeader } from "@/components/caravaneiro/caravaneiro-header";

export default async function CaravaneiroAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "caravaneiro") redirect("/login");

  return (
    <div className="min-h-dvh bg-[#0d47a1]">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-[#f5f7fa] pb-24 shadow-2xl">
        <CaravaneiroHeader userName={user.name} />
        <div className="flex-1">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
