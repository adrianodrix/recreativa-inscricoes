import "server-only";
import type { criarClienteServidor } from "./server";

type Cliente = Awaited<ReturnType<typeof criarClienteServidor>>;

/* Próxima posição no fim de uma lista do evento ordenada por `ordem` (0 quando vazia). */
export async function proximaOrdem(supabase: Cliente, tabela: "times" | "brincadeiras", eventoId: string): Promise<number> {
  const { data } = await supabase.from(tabela).select("ordem").eq("evento_id", eventoId).order("ordem", { ascending: false }).limit(1).maybeSingle();
  return (data?.ordem ?? -1) + 1;
}
