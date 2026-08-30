import { getSessionUser } from "@/lib/auth/session";
import { listAdmins } from "@/lib/supabase/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminsPageClient } from "./admins-client";
import { DeleteAdminButton } from "@/components/admin/delete-admin-button";

export default async function AdminsPage() {
  const current = await getSessionUser();
  const admins = await listAdmins();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Administradores</h1>
          <p className="text-muted-foreground">
            Gerencie quem tem acesso ao painel administrativo.
          </p>
        </div>
        <AdminsPageClient />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>
                  {admin.id !== current?.id && (
                    <DeleteAdminButton userId={admin.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
