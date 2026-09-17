import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { envPublico } from "@/lib/env-publico";

/*
 * Cliente com a chave secreta (ignora RLS). Uso restrito: worker de WhatsApp e
 * criação de usuários do painel. Nunca importar em código de cliente.
 */
export function criarClienteAdmin() {
  const chave = env().SUPABASE_SECRET_KEY;
  if (!chave) throw new Error("SUPABASE_SECRET_KEY não configurada");
  return createClient(envPublico.supabaseUrl, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
