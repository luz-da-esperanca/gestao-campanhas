"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateAdminForm } from "@/components/admin/create-admin-form";

export function AdminsPageClient() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-11" />}>
        <Plus className="size-4" />
        Novo administrador
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo administrador</DialogTitle>
        </DialogHeader>
        <CreateAdminForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
