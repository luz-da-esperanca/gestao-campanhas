export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

const PLACEHOLDER_PATTERNS = [
  "your-project",
  "your-anon-key",
  "your-service-role-key",
  "sb_publishable_...",
  "sb_secret_...",
];

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

/** Chave pública do Supabase (painel novo: PUBLISHABLE_KEY; antigo: ANON_KEY) */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Chave secreta do servidor (painel: sb_secret_ / service_role) */
export function getSupabaseServiceRoleKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim()
  );
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) return null;
  if (isPlaceholder(url) || isPlaceholder(anonKey)) return null;

  try {
    new URL(url);
  } catch {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}
