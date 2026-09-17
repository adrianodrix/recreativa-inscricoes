import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envPublico } from "@/lib/env-publico";
import type { Database } from "./types";

/*
 * Cliente Supabase para Server Components, Server Actions e Route Handlers,
 * autenticado pela sessão nos cookies (RLS ativa).
 */
export async function criarClienteServidor() {
  const cookieStore = await cookies();
  return createServerClient<Database>(envPublico.supabaseUrl, envPublico.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o proxy.ts renova a sessão nesse caso.
        }
      },
    },
  });
}
