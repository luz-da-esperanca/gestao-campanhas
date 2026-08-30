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
import { CreateCaravaneiroForm } from "@/components/admin/create-caravaneiro-form";

export function CaravaneirosPageClient() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="h-11" />}>
        <Plus className="size-4" />
        Novo caravaneiro
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo caravaneiro</DialogTitle>
        </DialogHeader>
        <CreateCaravaneiroForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
