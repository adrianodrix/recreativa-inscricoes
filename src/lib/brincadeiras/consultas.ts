import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { TextoRico } from "@/lib/texto-rico/schema";

export type BrincadeiraLinha = Database["public"]["Tables"]["brincadeiras"]["Row"];

export interface BrincadeiraPainel extends Omit<BrincadeiraLinha, "regras"> {
  regras: TextoRico;
  vagas_ocupadas: number;
}

export async function listarBrincadeiras(eventoId: string): Promise<BrincadeiraPainel[]> {
  const supabase = await criarClienteServidor();
  const [{ data: linhas, error }, { data: ocupadas }] = await Promise.all([
    supabase.from("brincadeiras").select("*").eq("evento_id", eventoId).order("ordem").order("nome"),
    supabase.from("participacoes").select("brincadeira_id").eq("evento_id", eventoId),
  ]);
  if (error) throw new Error(`Falha ao listar brincadeiras: ${error.message}`);
  const contagem = new Map<string, number>();
  for (const p of ocupadas ?? []) contagem.set(p.brincadeira_id, (contagem.get(p.brincadeira_id) ?? 0) + 1);
  return linhas.map((b) => ({ ...b, regras: b.regras as TextoRico, vagas_ocupadas: contagem.get(b.id) ?? 0 }));
}

export async function obterBrincadeira(eventoId: string, id: string): Promise<BrincadeiraPainel | null> {
  const lista = await listarBrincadeiras(eventoId);
  return lista.find((b) => b.id === id) ?? null;
}
