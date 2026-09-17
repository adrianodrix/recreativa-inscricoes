import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type { TextoRico } from "@/lib/texto-rico/schema";

/* Listas que alimentam a página inicial do evento (P8–P11), lidas pelo painel. */

export type ItemProgramacaoLinha = Database["public"]["Tables"]["programacao"]["Row"];
export type ContatoLinha = Database["public"]["Tables"]["contatos"]["Row"];
type PerguntaLinha = Database["public"]["Tables"]["perguntas_frequentes"]["Row"];

export interface PerguntaPainel extends Omit<PerguntaLinha, "resposta"> {
  resposta: TextoRico;
}

export async function listarProgramacao(eventoId: string): Promise<ItemProgramacaoLinha[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("programacao")
    .select("*")
    .eq("evento_id", eventoId)
    .order("hora_inicio")
    .order("titulo");
  if (error) throw new Error(`Falha ao listar a programação: ${error.message}`);
  return data;
}

export async function obterItemProgramacao(eventoId: string, id: string): Promise<ItemProgramacaoLinha | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("programacao").select("*").eq("evento_id", eventoId).eq("id", id).maybeSingle();
  return data;
}

export async function listarPerguntas(eventoId: string): Promise<PerguntaPainel[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("perguntas_frequentes")
    .select("*")
    .eq("evento_id", eventoId)
    .order("ordem")
    .order("criado_em");
  if (error) throw new Error(`Falha ao listar as dúvidas: ${error.message}`);
  return data.map((q) => ({ ...q, resposta: q.resposta as TextoRico }));
}

export async function obterPergunta(eventoId: string, id: string): Promise<PerguntaPainel | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("perguntas_frequentes").select("*").eq("evento_id", eventoId).eq("id", id).maybeSingle();
  return data ? { ...data, resposta: data.resposta as TextoRico } : null;
}

export async function listarContatos(eventoId: string): Promise<ContatoLinha[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("contatos")
    .select("*")
    .eq("evento_id", eventoId)
    .order("ordem")
    .order("criado_em");
  if (error) throw new Error(`Falha ao listar os contatos: ${error.message}`);
  return data;
}

export async function obterContato(eventoId: string, id: string): Promise<ContatoLinha | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("contatos").select("*").eq("evento_id", eventoId).eq("id", id).maybeSingle();
  return data;
}

export interface ResumoPaginaInicial {
  programacao: number;
  perguntas: number;
  contatos: number;
}

/* Quantos itens cada lista tem, para o cartão do painel do evento. */
export async function resumirPaginaInicial(eventoId: string): Promise<ResumoPaginaInicial> {
  const supabase = await criarClienteServidor();
  const contar = (tabela: "programacao" | "perguntas_frequentes" | "contatos") =>
    supabase.from(tabela).select("id", { count: "exact", head: true }).eq("evento_id", eventoId);
  const [programacao, perguntas, contatos] = await Promise.all([contar("programacao"), contar("perguntas_frequentes"), contar("contatos")]);
  return {
    programacao: programacao.count ?? 0,
    perguntas: perguntas.count ?? 0,
    contatos: contatos.count ?? 0,
  };
}

/* Qual evento a "/" mostra hoje (P5). Usa a mesma RPC da página pública. */
export async function idEventoEmDestaque(): Promise<string | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("obter_pagina_inicial");
  return (data as { id?: string } | null)?.id ?? null;
}
