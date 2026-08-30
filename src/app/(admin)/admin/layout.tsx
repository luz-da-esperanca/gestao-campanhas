import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col soft-page md:flex-row">
      <AdminSidebar userName={user.name} />
      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
