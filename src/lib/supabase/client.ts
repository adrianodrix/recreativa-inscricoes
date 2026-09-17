import { createBrowserClient } from "@supabase/ssr";
import { envPublico } from "@/lib/env-publico";
import type { Database } from "./types";

/* Cliente Supabase para Client Components (upload direto ao Storage, por exemplo). */
export function criarClienteNavegador() {
  return createBrowserClient<Database>(envPublico.supabaseUrl, envPublico.supabasePublishableKey);
}
