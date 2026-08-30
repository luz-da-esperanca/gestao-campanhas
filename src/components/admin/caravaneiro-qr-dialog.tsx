"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { QrDisplay } from "@/components/qr-display";
import { getConsultaUrl } from "@/lib/constants";

type CaravaneiroQrDialogProps = {
  publicId: string;
  nome: string;
};

export function CaravaneiroQrDialog({
  publicId,
  nome,
}: CaravaneiroQrDialogProps) {
  const url = getConsultaUrl(publicId);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <QrCode className="size-4" />
        Ver QR
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR — {nome}</DialogTitle>
        </DialogHeader>
        <QrDisplay url={url} label="Escaneie para consulta pública" />
      </DialogContent>
    </Dialog>
  );
}
