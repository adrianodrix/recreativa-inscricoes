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

export type PapelParticipante = Database["public"]["Enums"]["papel_participante"];

export interface PessoaDaVaga {
  id: string;
  nome: string;
  apelido: string | null;
  idade: number;
  papel: PapelParticipante;
}

/* Uma vaga ocupada: a pessoa, o casal ou a dupla, na ordem em que se inscreveram. */
export interface VagaOcupada {
  id: string;
  criado_em: string;
  pessoas: PessoaDaVaga[];
}

export async function listarVagasDaBrincadeira(eventoId: string, brincadeiraId: string): Promise<VagaOcupada[]> {
  const supabase = await criarClienteServidor();
  const [vagas, participantes] = await Promise.all([
    supabase.from("participacoes").select("id, criado_em").eq("evento_id", eventoId).eq("brincadeira_id", brincadeiraId).order("criado_em"),
    supabase.from("participantes").select("participacao_id, inscrito_id, papel").eq("evento_id", eventoId).eq("brincadeira_id", brincadeiraId),
  ]);
  if (vagas.error) throw new Error(`Falha ao listar participantes: ${vagas.error.message}`);
  const ids = [...new Set((participantes.data ?? []).map((p) => p.inscrito_id))];
  const { data: inscritos } = ids.length
    ? await supabase.from("inscritos").select("id, nome_completo, apelido, idade").eq("evento_id", eventoId).in("id", ids)
    : { data: [] };
  const pessoa = new Map((inscritos ?? []).map((i) => [i.id, i]));
  // Filho primeiro, depois o parceiro; nos demais casos a ordem de inscrição.
  const peso: Record<PapelParticipante, number> = { filho: 0, pessoa: 1, conjuge: 2, pai: 3, mae: 3, responsavel: 3 };
  return vagas.data.map((v) => ({
    ...v,
    pessoas: (participantes.data ?? [])
      .filter((p) => p.participacao_id === v.id)
      .map((p) => {
        const i = pessoa.get(p.inscrito_id);
        return { id: p.inscrito_id, nome: i?.nome_completo ?? "?", apelido: i?.apelido ?? null, idade: i?.idade ?? 0, papel: p.papel };
      })
      .sort((a, b) => peso[a.papel] - peso[b.papel]),
  }));
}
