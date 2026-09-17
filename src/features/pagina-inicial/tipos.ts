import type { Categoria } from "@/lib/brincadeiras/schema";
import type { MotivoFechado } from "@/lib/eventos/status";
import type { ItemProgramacao } from "@/lib/pagina-inicial/programacao";
import type { TextoRico } from "@/lib/texto-rico/schema";

/* O que a página inicial mostra do evento em destaque (P8). Vem da RPC obter_pagina_inicial. */

export interface EventoDestaque {
  id: string;
  nome: string;
  slug: string;
  edicao: number | null;
  subtitulo: string | null;
  descricao: string | null;
  data_evento: string;
  hora_inicio: string;
  hora_fim: string;
  endereco: string;
  link_maps: string;
  link_fotos: string | null;
  capa_path: string | null;
  valor_inscricao: number;
  inscricoes_inicio: string;
  inscricoes_fim: string;
  limite_inscritos: number;
  total_inscritos: number;
  motivo_fechado: MotivoFechado | null;
  recomendacoes: TextoRico | null;
  regras_gerais: TextoRico | null;
}

export interface PerguntaPublica {
  id: string;
  pergunta: string;
  resposta: TextoRico;
}

export interface ContatoPublico {
  id: string;
  nome: string;
  whatsapp: string;
}

export interface TimePublico {
  id: string;
  nome: string;
  imagem_path: string | null;
  cor_padrao: string;
  icone_padrao: string;
}

export interface BrincadeiraPublica {
  id: string;
  nome: string;
  foto_path: string | null;
  categoria: Categoria;
  lotada: boolean;
}

export interface DadosPaginaInicial {
  evento: EventoDestaque;
  programacao: ItemProgramacao[];
  perguntas: PerguntaPublica[];
  contatos: ContatoPublico[];
  times: TimePublico[];
  brincadeiras: BrincadeiraPublica[];
}
