import { createBrowserClient } from "@supabase/ssr";
import { envPublico } from "@/lib/env-publico";

/* Cliente Supabase para Client Components (upload direto ao Storage, por exemplo). */
export function criarClienteNavegador() {
  return createBrowserClient(envPublico.supabaseUrl, envPublico.supabasePublishableKey);
}
