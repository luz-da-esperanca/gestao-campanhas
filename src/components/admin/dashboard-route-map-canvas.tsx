"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { RotaRow } from "@/lib/supabase/campanhas";

const colors = ["#1976d2", "#2e7d32", "#c2410c", "#7e22ce"];

function MapBounds({ rotas }: { rotas: RotaRow[] }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(rotas.flatMap((r) => r.path.map((p) => L.latLng(p.lat, p.lng))));
    const resize = () => {
      map.invalidateSize();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, rotas]);
  return null;
}

export default function DashboardRouteMapCanvas({ rotas }: { rotas: RotaRow[] }) {
  const [tileError, setTileError] = useState(false);
  const tileEvents = useMemo(() => ({
    tileerror: () => setTileError(true),
    tileload: () => setTileError(false),
  }), []);

  return (
    <div>
      {tileError && (
        <p role="status" className="mb-2 text-sm text-destructive">
          Não foi possível carregar parte do mapa. Verifique sua conexão e recarregue a página.
        </p>
      )}
      <div className="relative isolate overflow-hidden rounded-xl border" aria-label="Mapa dos percursos das campanhas">
        <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} style={{ height: 320, width: "100%" }}>
          <TileLayer
            attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={tileEvents}
          />
          <MapBounds rotas={rotas} />
          {rotas.map((rota, index) => (
            <Polyline key={`${rota.campanhaId}:${rota.id}`} positions={rota.path} pathOptions={{ color: colors[index % colors.length], weight: 5 }}>
              <Popup>
                <strong>{rota.nome}</strong>
                <br />
                <Link href={`/admin/campanhas/${rota.campanhaId}`}>Abrir campanha</Link>
              </Popup>
            </Polyline>
          ))}
        </MapContainer>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Rotas no mapa">
        {rotas.map((rota, index) => (
          <li key={`${rota.campanhaId}:${rota.id}`}>
            <Link href={`/admin/campanhas/${rota.campanhaId}`} className="inline-flex items-center gap-2 text-primary underline">
              <span className="size-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true" />
              {rota.nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
