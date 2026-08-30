"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Navigation,
  Pencil,
  Check,
  X,
  Trash2,
  ExternalLink,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  buildGoogleMapsDirectionsUrl,
  getPathCenter,
  type MapPoint,
} from "@/lib/maps/route-utils";
import type { RotaRow } from "@/lib/supabase/campanhas";

const defaultCenter: MapPoint = { lat: -23.5505, lng: -46.6333 };

function FitBounds({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
  }, [map, points]);
  return null;
}

function MapClickHandler({
  enabled,
  onAdd,
}: {
  enabled: boolean;
  onAdd: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type RouteMapEditorProps = {
  savedRotas: RotaRow[];
  onSave: (nome: string, path: MapPoint[]) => void;
  onDelete: (rotaId: string) => void;
  pending?: boolean;
};

export function RouteMapEditor({
  savedRotas,
  onSave,
  onDelete,
  pending,
}: RouteMapEditorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [userPos, setUserPos] = useState<MapPoint | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const previewPath = useMemo(() => {
    if (!previewId) return [];
    const rota = savedRotas.find((r) => r.id === previewId);
    return rota?.path ?? [];
  }, [previewId, savedRotas]);

  const displayPath = isDrawing ? points : previewPath;
  const mapCenter =
    displayPath.length > 0 ? getPathCenter(displayPath) : defaultCenter;

  const startDrawing = () => {
    setPreviewId(null);
    setPoints([]);
    setIsDrawing(true);
    setError(null);
  };

  const cancelDrawing = () => {
    setIsDrawing(false);
    setPoints([]);
    setError(null);
  };

  const handleSave = () => {
    if (!nome.trim() || nome.trim().length < 2) {
      setError("Dê um nome para a rota antes de salvar.");
      return;
    }
    if (points.length < 2) {
      setError("Clique no mapa pelo menos duas vezes para formar a rota.");
      return;
    }
    setError(null);
    onSave(nome.trim(), points);
    setNome("");
    setPoints([]);
    setIsDrawing(false);
  };

  const addPoint = useCallback((lat: number, lng: number) => {
    setPoints((prev) => [...prev, { lat, lng }]);
  }, []);

  const toggleGps = () => {
    if (gpsActive) {
      setGpsActive(false);
      setUserPos(null);
      setAccuracy(null);
      return;
    }
    if (!navigator.geolocation) {
      setError("Geolocalização não disponível neste navegador.");
      return;
    }
    setGpsActive(true);
  };

  useEffect(() => {
    if (!gpsActive) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
      },
      () => {
        setError("Não foi possível acessar sua localização.");
        setGpsActive(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gpsActive]);

  const openGoogleMaps = (path: MapPoint[]) => {
    if (path.length < 2) return;
    window.open(buildGoogleMapsDirectionsUrl(path), "_blank", "noopener");
  };

  return (
    <div
      className="flex min-h-[min(720px,calc(100vh-10rem))] flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm lg:flex-row"
    >
      {/* Painel lateral — inspirado no route_manager de Gabriel */}
      <aside
        className="flex w-full flex-col gap-4 border-b border-border/60 bg-muted/30 p-4 lg:w-[340px] lg:border-b-0 lg:border-r"
      >
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Route className="size-4 text-primary" />
            Planejador de rotas
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Desenhe no mapa, salve no sistema e exporte para navegação no
            Google Maps.
          </p>
        </div>

        <Button
          type="button"
          variant={gpsActive ? "destructive" : "outline"}
          className="h-10 w-full justify-center gap-2"
          onClick={toggleGps}
        >
          <Navigation className="size-4" />
          {gpsActive ? "Parar rastreamento" : "Mostrar minha localização"}
        </Button>

        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
          {isDrawing
            ? "Modo desenho ativo: clique no mapa para marcar cada ponto do percurso."
            : "Clique em “Começar a desenhar” e marque os pontos no mapa ao lado."}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="rota-nome">Nome da rota</Label>
          <Input
            id="rota-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Quadra A — manhã"
            className="h-10 bg-background"
            disabled={!isDrawing && points.length === 0}
          />
        </div>

        <div className="flex flex-col gap-2">
          {!isDrawing ? (
            <Button
              type="button"
              className="h-10 gap-2"
              onClick={startDrawing}
              disabled={pending}
            >
              <Pencil className="size-4" />
              Começar a desenhar
            </Button>
          ) : (
            <>
              <Button
                type="button"
                className="h-10 gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={handleSave}
                disabled={pending}
              >
                <Check className="size-4" />
                {pending ? "Salvando..." : "Salvar rota"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                onClick={cancelDrawing}
                disabled={pending}
              >
                <X className="size-4" />
                Cancelar
              </Button>
            </>
          )}
        </div>

        {isDrawing && points.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pontos marcados</span>
            <Badge variant="secondary">{points.length}</Badge>
          </div>
        )}

        <div className="mt-2 flex-1 overflow-hidden">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Rotas salvas ({savedRotas.length})
          </h4>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1 lg:max-h-none">
            {savedRotas.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                Nenhuma rota salva nesta campanha.
              </p>
            ) : (
              savedRotas.map((rota) => (
                <div
                  key={rota.id}
                  className={cn(
                    "rounded-lg border bg-background p-3 transition-colors",
                    previewId === rota.id && "border-primary/50 ring-1 ring-primary/20",
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      setIsDrawing(false);
                      setPoints([]);
                      setPreviewId(rota.id);
                    }}
                  >
                    <span className="font-medium text-sm">{rota.nome}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {rota.path.length} pontos
                    </span>
                  </button>
                  <div className="mt-2 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1 gap-1 text-xs"
                      onClick={() => openGoogleMaps(rota.path)}
                    >
                      <ExternalLink className="size-3" />
                      Google Maps
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-8 gap-1 text-xs"
                      onClick={() => onDelete(rota.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Mapa em tela cheia ao lado */}
      <div className="relative min-h-[420px] flex-1 bg-muted/20">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          className={cn(
            "absolute inset-0 z-0 h-full w-full",
            isDrawing && "cursor-crosshair [&_.leaflet-container]:cursor-crosshair",
          )}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler enabled={isDrawing} onAdd={addPoint} />
          {displayPath.length >= 2 && (
            <FitBounds points={displayPath} />
          )}
          {userPos && (
            <>
              <CircleMarker
                center={userPos}
                radius={8}
                pathOptions={{
                  color: "#fff",
                  weight: 2,
                  fillColor: "#2563eb",
                  fillOpacity: 1,
                }}
              />
              {accuracy && (
                <Circle
                  center={userPos}
                  radius={accuracy}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 1,
                    opacity: 0.25,
                    fillOpacity: 0.08,
                  }}
                />
              )}
            </>
          )}
          {displayPath.map((p, i) => (
            <CircleMarker
              key={`${p.lat}-${p.lng}-${i}`}
              center={p}
              radius={isDrawing ? 6 : 5}
              pathOptions={{
                color: isDrawing ? "#dc2626" : "#d97706",
                weight: 2,
                fillColor: isDrawing ? "#ef4444" : "#f59e0b",
                fillOpacity: 1,
              }}
            />
          ))}
          {displayPath.length >= 2 && (
            <Polyline
              positions={displayPath}
              pathOptions={{
                color: isDrawing ? "#dc2626" : "#2563eb",
                weight: 5,
                opacity: 0.85,
              }}
            />
          )}
        </MapContainer>

        {isDrawing && (
          <div className="absolute left-4 top-4 z-[1000] rounded-lg bg-background/95 px-3 py-2 text-xs shadow-md ring-1 ring-border">
            <MapPin className="mr-1 inline size-3.5 text-primary" />
            Clique no mapa para adicionar pontos
          </div>
        )}
      </div>
    </div>
  );
}
