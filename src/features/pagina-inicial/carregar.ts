import "server-only";
import type { MotivoFechado } from "@/lib/eventos/status";
import type { ItemProgramacao } from "@/lib/pagina-inicial/programacao";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { TextoRico } from "@/lib/texto-rico/schema";
import type {
  BrincadeiraPublica,
  ContatoPublico,
  DadosPaginaInicial,
  PerguntaPublica,
  TimePublico,
} from "./tipos";

type Bruto = Record<string, unknown>;
const lista = (valor: unknown): Bruto[] => (Array.isArray(valor) ? (valor as Bruto[]) : []);

/*
 * Evento em destaque com tudo o que a página mostra, por uma RPC pública (anon).
 * A "/" é a porta de entrada do site: se o banco falhar (migration ainda não
 * aplicada, indisponibilidade), registra o erro e devolve null, e a página cai
 * na capa da marca em vez de responder erro para quem chegou pelo link.
 */
export async function carregarPaginaInicial(): Promise<DadosPaginaInicial | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("obter_pagina_inicial");
  if (error) {
    console.error(`Falha ao carregar a página inicial: ${error.message}`);
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return montar(data as Bruto);
}

export function montar(e: Bruto): DadosPaginaInicial {
  return {
    evento: {
      id: e.id as string,
      nome: e.nome as string,
      slug: e.slug as string,
      edicao: (e.edicao as number | null) ?? null,
      subtitulo: (e.subtitulo as string | null) ?? null,
      descricao: (e.descricao as string | null) ?? null,
      data_evento: e.data_evento as string,
      hora_inicio: e.hora_inicio as string,
      hora_fim: e.hora_fim as string,
      endereco: e.endereco as string,
      link_maps: e.link_maps as string,
      link_fotos: (e.link_fotos as string | null) ?? null,
      capa_path: (e.capa_path as string | null) ?? null,
      valor_inscricao: Number(e.valor_inscricao ?? 0),
      inscricoes_inicio: e.inscricoes_inicio as string,
      inscricoes_fim: e.inscricoes_fim as string,
      limite_inscritos: Number(e.limite_inscritos ?? 0),
      total_inscritos: Number(e.total_inscritos ?? 0),
      motivo_fechado: (e.motivo_fechado as MotivoFechado | null) ?? null,
      recomendacoes: (e.recomendacoes as TextoRico | null) ?? null,
      regras_gerais: (e.regras_gerais as TextoRico | null) ?? null,
    },
    programacao: lista(e.programacao).map(
      (p): ItemProgramacao => ({
        id: p.id as string,
        hora_inicio: p.hora_inicio as string,
        hora_fim: (p.hora_fim as string | null) ?? null,
        titulo: p.titulo as string,
        detalhe: (p.detalhe as string | null) ?? null,
        destaque: Boolean(p.destaque),
        brincadeira: (p.brincadeira as string | null) ?? null,
      }),
    ),
    perguntas: lista(e.perguntas).map(
      (q): PerguntaPublica => ({ id: q.id as string, pergunta: q.pergunta as string, resposta: q.resposta as TextoRico }),
    ),
    contatos: lista(e.contatos).map(
      (c): ContatoPublico => ({ id: c.id as string, nome: c.nome as string, whatsapp: c.whatsapp as string }),
    ),
    times: lista(e.times).map(
      (t): TimePublico => ({
        id: t.id as string,
        nome: t.nome as string,
        imagem_path: (t.imagem_path as string | null) ?? null,
        cor_padrao: t.cor_padrao as string,
        icone_padrao: t.icone_padrao as string,
      }),
    ),
    brincadeiras: lista(e.brincadeiras).map(
      (b): BrincadeiraPublica => ({
        id: b.id as string,
        nome: b.nome as string,
        foto_path: (b.foto_path as string | null) ?? null,
        categoria: b.categoria as BrincadeiraPublica["categoria"],
        lotada: Boolean(b.lotada),
      }),
    ),
  };
}
