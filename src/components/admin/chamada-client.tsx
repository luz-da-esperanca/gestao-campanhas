"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  marcarPresencaAction,
  removerPresencaAction,
  marcarPresencaQrAction,
} from "@/lib/auth/phase3-actions";
import type { ChamadaItem } from "@/lib/supabase/presencas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  QrCode,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";
import dynamic from "next/dynamic";

const QrScanner = dynamic(
  () =>
    import("@/components/admin/qr-scanner").then((m) => m.QrScanner),
  { ssr: false },
);

type ChamadaClientProps = {
  campanhaId: string;
  campanhaNome: string;
  items: ChamadaItem[];
  usaListaAberta: boolean;
};

export function ChamadaClient({
  campanhaId,
  campanhaNome,
  items: initialItems,
  usaListaAberta,
}: ChamadaClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const presentes = initialItems.filter((i) => i.presente).length;
  const total = initialItems.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return initialItems;
    return initialItems.filter(
      (i) =>
        i.nome.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        i.publicId.toLowerCase().includes(q),
    );
  }, [initialItems, search]);

  const toggle = async (item: ChamadaItem) => {
    setPendingId(item.caravaneiroId);
    const result = item.presente
      ? await removerPresencaAction(campanhaId, item.caravaneiroId)
      : await marcarPresencaAction(campanhaId, item.caravaneiroId, "MANUAL");
    setPendingId(null);
    if (result?.error) toast.error(result.error);
    else {
      toast.success(
        item.presente ? "Presença removida" : `${item.nome} — presente`,
      );
      router.refresh();
    }
  };

  const onQrScan = async (decoded: string) => {
    setScanOpen(false);
    const result = await marcarPresencaQrAction(campanhaId, decoded);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Presença registrada via QR");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-8">
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-2"
        render={<Link href={`/admin/campanhas/${campanhaId}`} />}
      >
        <ArrowLeft className="size-4" />
        Voltar à campanha
      </Button>

      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h1 className="text-xl font-bold">Chamada</h1>
        <p className="text-sm text-muted-foreground">{campanhaNome}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="gap-1 bg-emerald-600">
            <UserCheck className="size-3.5" />
            {presentes} presentes
          </Badge>
          <Badge variant="outline">{total} na lista</Badge>
          {usaListaAberta && (
            <Badge variant="secondary" className="text-xs">
              Lista aberta (todos ativos)
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          className="h-14 gap-2 text-base"
          onClick={() => setScanOpen(true)}
        >
          <QrCode className="size-5" />
          Escanear QR
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 pl-10 text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Ninguém na lista. Adicione participantes na campanha.
          </p>
        ) : (
          filtered.map((item) => (
            <button
              key={item.caravaneiroId}
              type="button"
              disabled={pendingId === item.caravaneiroId}
              onClick={() => toggle(item)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors active:scale-[0.98]",
                item.presente
                  ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30"
                  : "bg-card hover:bg-muted/50",
              )}
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{item.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {item.metodo === "QR" ? "Via QR" : item.presente ? "Manual" : "Toque para marcar"}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  item.presente
                    ? "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {item.presente ? (
                  <Check className="size-5" />
                ) : (
                  <UserX className="size-5" />
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {scanOpen && (
        <QrScanner onScan={onQrScan} onClose={() => setScanOpen(false)} />
      )}
    </div>
  );
}
