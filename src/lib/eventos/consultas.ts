import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { TextoRico } from "@/lib/texto-rico/schema";
import type { TipoComida } from "./schema";
import { contarInscritosDoEvento } from "@/lib/inscritos/consultas";

export type EventoLinha = Database["public"]["Tables"]["eventos"]["Row"];

export interface EventoCompleto extends Omit<EventoLinha, "boas_vindas" | "agradecimento" | "recomendacoes" | "regras_gerais"> {
  boas_vindas: TextoRico | null;
  agradecimento: TextoRico;
  recomendacoes: TextoRico | null;
  regras_gerais: TextoRico | null;
  limites: Record<TipoComida, number>;
  total_inscritos: number;
}

export async function listarEventos(): Promise<EventoLinha[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("eventos").select("*").order("data_evento", { ascending: false });
  if (error) throw new Error(`Falha ao listar eventos: ${error.message}`);
  return data;
}

export async function obterEvento(id: string): Promise<EventoCompleto | null> {
  const supabase = await criarClienteServidor();
  const [{ data: evento }, { data: limites }] = await Promise.all([
    supabase.from("eventos").select("*").eq("id", id).maybeSingle(),
    supabase.from("limites_comida").select("tipo, limite").eq("evento_id", id),
  ]);
  if (!evento) return null;
  const mapa = { salgado: 0, doce: 0, refrigerante: 0, suco: 0 } as Record<TipoComida, number>;
  for (const l of limites ?? []) mapa[l.tipo] = l.limite;
  return {
    ...evento,
    boas_vindas: evento.boas_vindas as TextoRico | null,
    agradecimento: evento.agradecimento as TextoRico,
    recomendacoes: evento.recomendacoes as TextoRico | null,
    regras_gerais: evento.regras_gerais as TextoRico | null,
    limites: mapa,
    total_inscritos: await contarInscritos(id),
  };
}

export async function contarInscritos(eventoId: string): Promise<number> {
  return contarInscritosDoEvento(eventoId);
}
