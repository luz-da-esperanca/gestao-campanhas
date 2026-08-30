export const APP_NAME = "Luz da Esperança";
export const APP_SHORT_NAME = "Luz da Esperança";
export const APP_TAGLINE = "Sistema de campanhas e caravaneiros";

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export function getConsultaUrl(publicId: string): string {
  return `${getAppUrl()}/consulta/${publicId}`;
}
