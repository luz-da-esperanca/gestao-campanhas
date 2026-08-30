import { createClient } from "@supabase/supabase-js";
import { getSupabaseServiceRoleKey } from "@/lib/supabase/env";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = getSupabaseServiceRoleKey();

  if (
    !url ||
    !key ||
    url.includes("your-project") ||
    key.includes("your-service") ||
    key.endsWith("...")
  ) {
    throw new Error(
      "Supabase admin não configurado. Defina SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_SECRET_KEY) em .env.local",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
