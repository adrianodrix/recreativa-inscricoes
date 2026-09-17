import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type InscritoLinha = Database["public"]["Tables"]["inscritos"]["Row"];
export type PapelParticipante = Database["public"]["Enums"]["papel_participante"];

export interface ParticipacaoResumo {
  participacao_id: string;
  brincadeira_id: string;
  brincadeira: string;
  papel: PapelParticipante;
}

export interface InscritoResumo extends InscritoLinha {
  comida: Database["public"]["Enums"]["tipo_comida"] | null;
  principal_nome: string | null;
  participacoes: ParticipacaoResumo[];
}

/* Inscritos de um evento com comida, principal e brincadeiras, unidos em memória (poucas centenas de linhas). */
export async function listarInscritos(eventoId: string, busca = ""): Promise<InscritoResumo[]> {
  const supabase = await criarClienteServidor();
  const [inscritos, colaboracoes, participantes, brincadeiras] = await Promise.all([
    supabase.from("inscritos").select("*").eq("evento_id", eventoId).order("nome_completo"),
    supabase.from("colaboracoes").select("inscrito_id, tipo").eq("evento_id", eventoId),
    supabase.from("participantes").select("inscrito_id, participacao_id, brincadeira_id, papel").eq("evento_id", eventoId),
    supabase.from("brincadeiras").select("id, nome").eq("evento_id", eventoId),
  ]);
  if (inscritos.error) throw new Error(`Falha ao listar inscritos: ${inscritos.error.message}`);

  const nomes = new Map(inscritos.data.map((i) => [i.id, i.nome_completo]));
  const comida = new Map((colaboracoes.data ?? []).map((c) => [c.inscrito_id, c.tipo]));
  const nomeBrincadeira = new Map((brincadeiras.data ?? []).map((b) => [b.id, b.nome]));
  const porInscrito = new Map<string, ParticipacaoResumo[]>();
  for (const p of participantes.data ?? []) {
    const lista = porInscrito.get(p.inscrito_id) ?? [];
    lista.push({ participacao_id: p.participacao_id, brincadeira_id: p.brincadeira_id, brincadeira: nomeBrincadeira.get(p.brincadeira_id) ?? "?", papel: p.papel });
    porInscrito.set(p.inscrito_id, lista);
  }

  const termo = busca.trim().toLowerCase();
  return inscritos.data
    .filter((i) => !termo || (i.nome_normalizado ?? "").includes(termo) || (i.apelido ?? "").toLowerCase().includes(termo))
    .map((i) => ({
      ...i,
      comida: comida.get(i.id) ?? null,
      principal_nome: i.inscrito_principal_id ? (nomes.get(i.inscrito_principal_id) ?? null) : null,
      participacoes: porInscrito.get(i.id) ?? [],
    }));
}

export async function obterInscrito(eventoId: string, id: string): Promise<InscritoResumo | null> {
  const lista = await listarInscritos(eventoId);
  return lista.find((i) => i.id === id) ?? null;
}

export async function contarInscritosDoEvento(eventoId: string): Promise<number> {
  const supabase = await criarClienteServidor();
  const { count } = await supabase.from("inscritos").select("id", { count: "exact", head: true }).eq("evento_id", eventoId);
  return count ?? 0;
}
