"use client";

import { deleteCaravaneiroAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteCaravaneiroButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Excluir este caravaneiro? A conta de login será removida."))
      return;
    startTransition(async () => {
      const result = await deleteCaravaneiroAction(id);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Caravaneiro excluído");
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={pending}
      aria-label="Excluir"
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
