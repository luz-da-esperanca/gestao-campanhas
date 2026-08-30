export type MapPoint = { lat: number; lng: number };

/** Identifica vértices importantes para exportar ao Google Maps (limite ~10 pontos). */
function getTurnSharpness(
  p1: MapPoint,
  p2: MapPoint,
  p3: MapPoint,
): number {
  const dx1 = p2.lng - p1.lng;
  const dy1 = p2.lat - p1.lat;
  const dx2 = p3.lng - p2.lng;
  const dy2 = p3.lat - p2.lat;
  const dotProduct = dx1 * dx2 + dy1 * dy2;
  const mag1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
  const mag2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
  if (mag1 === 0 || mag2 === 0) return 1;
  return dotProduct / (mag1 * mag2);
}

export function optimizePathForGoogleMaps(path: MapPoint[]): MapPoint[] {
  if (path.length <= 10) return path;

  const start = path[0];
  const end = path[path.length - 1];
  const scored: Array<{ point: MapPoint; index: number; score: number }> = [];

  for (let i = 1; i < path.length - 1; i++) {
    const sharpness = getTurnSharpness(path[i - 1], path[i], path[i + 1]);
    scored.push({ point: path[i], index: i, score: sharpness });
  }

  scored.sort((a, b) => a.score - b.score);
  const top = scored.slice(0, 8).sort((a, b) => a.index - b.index);

  return [start, ...top.map((v) => v.point), end];
}

export function buildGoogleMapsDirectionsUrl(path: MapPoint[]): string {
  const points = optimizePathForGoogleMaps(path);
  let url = "https://www.google.com/maps/dir/";
  for (const p of points) {
    url += `${p.lat},${p.lng}/`;
  }
  return url;
}

export function getPathCenter(path: MapPoint[]): MapPoint {
  if (path.length === 0) return { lat: -23.5505, lng: -46.6333 };
  const lat = path.reduce((s, p) => s + p.lat, 0) / path.length;
  const lng = path.reduce((s, p) => s + p.lng, 0) / path.length;
  return { lat, lng };
}
