"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type QrScannerProps = {
  onScan: (decoded: string) => void;
  onClose: () => void;
};

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const regionId = "qr-reader-region";

  useEffect(() => {
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          onScan(decoded);
        },
        () => {},
      )
      .catch(() => {
        setError("Não foi possível abrir a câmera. Use a marcação manual.");
      });

    return () => {
      scanner.stop().catch(() => {});
      try {
        scanner.clear();
      } catch {
        /* ignore */
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-medium">Aponte ao QR do caravaneiro</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={onClose}
        >
          <X className="size-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden px-4">
        <div id={regionId} className="w-full rounded-xl overflow-hidden" />
      </div>
      {error && (
        <p className="p-4 text-center text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
