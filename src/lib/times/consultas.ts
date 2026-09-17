import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { Alocacao, EntradaMontagem, PessoaTime, VinculoResponsavel } from "./tipos";

export type TimeLinha = Database["public"]["Tables"]["times"]["Row"];

export interface TimeComContagem extends TimeLinha {
  membros: number;
}

export async function listarTimes(eventoId: string): Promise<TimeComContagem[]> {
  const supabase = await criarClienteServidor();
  const [{ data: times, error }, { data: membros }] = await Promise.all([
    supabase.from("times").select("*").eq("evento_id", eventoId).order("ordem").order("nome"),
    supabase.from("membros_time").select("time_id").eq("evento_id", eventoId),
  ]);
  if (error) throw new Error(`Falha ao listar times: ${error.message}`);
  const contagem = new Map<string, number>();
  for (const m of membros ?? []) contagem.set(m.time_id, (contagem.get(m.time_id) ?? 0) + 1);
  return times.map((t) => ({ ...t, membros: contagem.get(t.id) ?? 0 }));
}

export async function obterTime(eventoId: string, id: string): Promise<TimeLinha | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("times").select("*").eq("evento_id", eventoId).eq("id", id).maybeSingle();
  return data;
}

export interface DadosMontagem {
  entrada: EntradaMontagem;
  alocacao: Alocacao;
  alocacaoNotificada: Alocacao;
}

/* Tudo que o quadro de montagem precisa: elegíveis (T13), vínculos de responsável (T14), times e alocação atual. */
export async function carregarMontagem(eventoId: string, semente: number | null): Promise<DadosMontagem> {
  const supabase = await criarClienteServidor();
  const [inscritos, participantes, times, membros] = await Promise.all([
    supabase.from("inscritos").select("id, nome_completo, idade, casado, vinculo, inscrito_principal_id").eq("evento_id", eventoId),
    supabase.from("participantes").select("participacao_id, inscrito_id, papel").eq("evento_id", eventoId).in("papel", ["filho", "responsavel"]),
    supabase.from("times").select("id, nome").eq("evento_id", eventoId).order("ordem").order("nome"),
    supabase.from("membros_time").select("inscrito_id, time_id, time_notificado_id").eq("evento_id", eventoId),
  ]);
  if (inscritos.error) throw new Error(`Falha ao carregar inscritos: ${inscritos.error.message}`);

  const pessoas: PessoaTime[] = [];
  for (const i of inscritos.data) {
    const crianca = i.idade <= 8;
    const jovem = !i.casado && i.idade >= 9 && i.idade <= 30;
    if (!crianca && !jovem) continue;
    pessoas.push({
      id: i.id,
      nome: i.nome_completo,
      idade: i.idade,
      categoria: crianca ? "crianca" : "jovem",
      familiaId: i.vinculo === "filho" ? i.inscrito_principal_id : null,
    });
  }

  const porParticipacao = new Map<string, { filho?: string; responsavel?: string }>();
  for (const p of participantes.data ?? []) {
    const atual = porParticipacao.get(p.participacao_id) ?? {};
    if (p.papel === "filho") atual.filho = p.inscrito_id;
    if (p.papel === "responsavel") atual.responsavel = p.inscrito_id;
    porParticipacao.set(p.participacao_id, atual);
  }
  const vinculos: VinculoResponsavel[] = [];
  for (const v of porParticipacao.values()) {
    if (v.filho && v.responsavel) vinculos.push({ criancaId: v.filho, responsavelId: v.responsavel });
  }

  const alocacao: Alocacao = {};
  const alocacaoNotificada: Alocacao = {};
  for (const m of membros.data ?? []) {
    alocacao[m.inscrito_id] = m.time_id;
    if (m.time_notificado_id) alocacaoNotificada[m.inscrito_id] = m.time_notificado_id;
  }

  return {
    entrada: { pessoas, vinculos, times: (times.data ?? []).map((t) => ({ id: t.id, nome: t.nome })), semente: semente ?? undefined },
    alocacao,
    alocacaoNotificada,
  };
}

export interface MembroDoTime {
  id: string;
  nome: string;
  apelido: string | null;
  idade: number;
  categoria: "crianca" | "jovem";
}

/* Quem está no time hoje (crianças e jovens), em ordem alfabética. */
export async function listarMembrosDoTime(eventoId: string, timeId: string): Promise<MembroDoTime[]> {
  const supabase = await criarClienteServidor();
  const { data: membros, error } = await supabase.from("membros_time").select("inscrito_id").eq("evento_id", eventoId).eq("time_id", timeId);
  if (error) throw new Error(`Falha ao listar membros: ${error.message}`);
  const ids = membros.map((m) => m.inscrito_id);
  if (ids.length === 0) return [];
  const { data: inscritos } = await supabase.from("inscritos").select("id, nome_completo, apelido, idade").eq("evento_id", eventoId).in("id", ids).order("nome_completo");
  return (inscritos ?? []).map((i) => ({ id: i.id, nome: i.nome_completo, apelido: i.apelido, idade: i.idade, categoria: i.idade <= 8 ? "crianca" : "jovem" }));
}
