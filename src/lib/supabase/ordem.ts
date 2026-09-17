import "server-only";
import type { criarClienteServidor } from "./server";

type Cliente = Awaited<ReturnType<typeof criarClienteServidor>>;
type Tabela = "times" | "brincadeiras" | "perguntas_frequentes" | "contatos";

/* Próxima posição no fim de uma lista do evento ordenada por `ordem` (0 quando vazia). */
export async function proximaOrdem(supabase: Cliente, tabela: Tabela, eventoId: string): Promise<number> {
  const { data } = await supabase.from(tabela).select("ordem").eq("evento_id", eventoId).order("ordem", { ascending: false }).limit(1).maybeSingle();
  return (data?.ordem ?? -1) + 1;
}

/* Grava a ordem da lista na sequência em que os ids chegam (arrastar e soltar). */
export async function gravarOrdem(supabase: Cliente, tabela: Tabela, eventoId: string, ids: string[]): Promise<void> {
  const resultados = await Promise.all(ids.map((id, i) => supabase.from(tabela).update({ ordem: i }).eq("id", id).eq("evento_id", eventoId)));
  const falha = resultados.find((r) => r.error)?.error;
  if (falha) throw new Error(`Não foi possível reordenar: ${falha.message}`);
}
