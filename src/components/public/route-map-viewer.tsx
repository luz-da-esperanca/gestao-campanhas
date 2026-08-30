"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, MapPin, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  buildGoogleMapsDirectionsUrl,
  getPathCenter,
  type MapPoint,
} from "@/lib/maps/route-utils";

type RouteItem = {
  id: string;
  nome: string;
  path: MapPoint[];
};

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [map, points]);
  return null;
}

export function RouteMapViewer({ rotas }: { rotas: RouteItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    rotas[0]?.id ?? null,
  );

  const selected = useMemo(
    () => rotas.find((r) => r.id === selectedId),
    [rotas, selectedId],
  );

  const path = selected?.path ?? [];
  const center = path.length > 0 ? getPathCenter(path) : { lat: -23.5505, lng: -46.6333 };

  if (rotas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Esta campanha ainda não tem rotas publicadas no mapa.
      </div>
    );
  }

  return (
    <div className="flex min-h-[min(560px,calc(100vh-12rem))] flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm lg:flex-row">
      <aside className="border-b border-border/60 bg-muted/20 p-4 lg:w-72 lg:border-b-0 lg:border-r">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Route className="size-4 text-primary" />
          Rotas da campanha
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Selecione uma rota para visualizar. Somente leitura.
        </p>
        <div className="mt-4 space-y-2">
          {rotas.map((rota) => (
            <button
              key={rota.id}
              type="button"
              onClick={() => setSelectedId(rota.id)}
              className={cn(
                "w-full rounded-lg border p-3 text-left transition-colors",
                selectedId === rota.id
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  : "bg-background hover:bg-muted/50",
              )}
            >
              <span className="font-medium text-sm">{rota.nome}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {rota.path.length} pontos
              </span>
            </button>
          ))}
        </div>
        {selected && selected.path.length >= 2 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 w-full gap-2"
            onClick={() =>
              window.open(
                buildGoogleMapsDirectionsUrl(selected.path),
                "_blank",
                "noopener",
              )
            }
          >
            <ExternalLink className="size-3.5" />
            Abrir no Google Maps
          </Button>
        )}
      </aside>

      <div className="relative min-h-[360px] flex-1 bg-muted/10">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          className="absolute inset-0 z-0 h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {path.length >= 2 && <FitBounds points={path} />}
          {path.map((p, i) => (
            <CircleMarker
              key={`${p.lat}-${p.lng}-${i}`}
              center={p}
              radius={5}
              pathOptions={{
                color: "#d97706",
                weight: 2,
                fillColor: "#f59e0b",
                fillOpacity: 1,
              }}
            />
          ))}
          {path.length >= 2 && (
            <Polyline
              positions={path}
              pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.85 }}
            />
          )}
        </MapContainer>
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-lg bg-background/95 px-3 py-2 text-xs shadow-md ring-1 ring-border">
          <MapPin className="size-3.5 text-primary" />
          Visualização pública
          <Badge variant="secondary" className="text-[10px]">somente leitura</Badge>
        </div>
      </div>
    </div>
  );
}
