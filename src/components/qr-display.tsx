"use client";

import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

type QrDisplayProps = {
  url: string;
  label?: string;
};

export function QrDisplay({ url, label }: QrDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <QRCode value={url} size={200} level="M" />
      </div>
      {label && (
        <p className="text-center text-sm text-muted-foreground">{label}</p>
      )}
      <p className="max-w-xs break-all text-center text-xs text-muted-foreground">
        {url}
      </p>
      <Button type="button" variant="outline" size="lg" onClick={copyLink}>
        {copied ? (
          <>
            <Check className="size-4" />
            Copiado!
          </>
        ) : (
          <>
            <Copy className="size-4" />
            Copiar link
          </>
        )}
      </Button>
    </div>
  );
}
