import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type AvisoLinha = Database["public"]["Tables"]["avisos_whatsapp"]["Row"];

export interface ResumoFila {
  pendente: number;
  enviando: number;
  enviado: number;
  falhou: number;
}

export async function resumoFila(eventoId: string): Promise<ResumoFila> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("avisos_whatsapp").select("status").eq("evento_id", eventoId);
  const r: ResumoFila = { pendente: 0, enviando: 0, enviado: 0, falhou: 0 };
  for (const a of data ?? []) r[a.status] += 1;
  return r;
}

export async function avisosDoInscrito(inscritoId: string): Promise<AvisoLinha[]> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("avisos_whatsapp").select("*").eq("inscrito_id", inscritoId).order("criado_em", { ascending: false }).limit(20);
  return data ?? [];
}
