"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditCaravaneiroForm } from "@/components/admin/edit-caravaneiro-form";
import { DeleteCaravaneiroButton } from "@/components/admin/delete-caravaneiro-button";

type CaravaneiroRowActionsProps = {
  id: string;
  nome: string;
  telefone: string | null;
  ativo: boolean;
};

export function CaravaneiroRowActions(props: CaravaneiroRowActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <Pencil className="size-4" />
          Editar
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar caravaneiro</DialogTitle>
          </DialogHeader>
          <EditCaravaneiroForm
            {...props}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <DeleteCaravaneiroButton id={props.id} />
    </>
  );
}
