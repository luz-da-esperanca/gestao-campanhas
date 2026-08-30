"use client";

import { deleteAdminAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteAdminButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Excluir este administrador?")) return;
    startTransition(async () => {
      const result = await deleteAdminAction(userId);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Administrador excluído");
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
