import type { TextoRico } from "@/lib/texto-rico/schema";

export type TipoComida = "salgado" | "doce" | "refrigerante" | "suco";
/* Resposta da etapa de comida: um tipo ou "não vou contribuir" (só no rascunho; no payload vira ausência). */
export type EscolhaComida = TipoComida | "nenhuma";
export type Categoria = "casais" | "jovens" | "criancas" | "pais_e_filhos";
export type Formato = "individual" | "em_grupo";
export type OpcaoDependente = "sim" | "nao_cadastrar" | "vai_se_cadastrar";
export type PapelPrincipal = "pai" | "mae";

/* Chave de uma pessoa dentro do rascunho. */
export type PessoaKey = "principal" | "conjuge" | `filho:${number}`;

export interface Pessoa {
  nome: string;
  nascimento: string; // yyyy-mm-dd
}

export type Parceiro =
  | { tipo: "pai_mae"; pessoa: "principal" | "conjuge"; papel: PapelPrincipal }
  | { tipo: "responsavel"; inscritoId: string; nome: string; apelido: string | null };

export type Participacao =
  | { brincadeiraId: string; pessoa: PessoaKey } // crianças, jovens
  | { brincadeiraId: string; casal: true } // casais
  | { brincadeiraId: string; filho: PessoaKey; parceiro: Parceiro }; // pais e filhos

export interface InscricaoDraft {
  principal: Pessoa & { apelido?: string; casado?: boolean };
  conjugeOpcao?: OpcaoDependente;
  conjuge?: Pessoa;
  temFilhosMenores?: boolean;
  filhosOpcao?: OpcaoDependente;
  filhos: Pessoa[];
  papelPrincipal?: PapelPrincipal;
  comida: Partial<Record<PessoaKey, EscolhaComida>>;
  /* Respostas "não" também ficam registradas, para não perguntar de novo. */
  recusadas: string[];
  participacoes: Participacao[];
  whatsapp?: string;
}

export const DRAFT_INICIAL: InscricaoDraft = {
  principal: { nome: "", nascimento: "" },
  filhos: [],
  comida: {},
  recusadas: [],
  participacoes: [],
};

export interface BrincadeiraPublica {
  id: string;
  nome: string;
  foto_path: string | null;
  video_url: string | null;
  regras: TextoRico;
  categoria: Categoria;
  formato: Formato | null;
  vagas_restantes: number;
}

export interface EventoPublico {
  id: string;
  nome: string;
  slug: string;
  data_evento: string;
  hora_inicio: string;
  hora_fim: string;
  endereco: string;
  link_maps: string;
  boas_vindas: TextoRico | null;
  agradecimento: TextoRico;
  recomendacoes: TextoRico | null;
  valor_inscricao: number;
  motivo_fechado: string | null;
  comida_disponivel: Record<TipoComida, number>;
  brincadeiras: BrincadeiraPublica[];
}

/* Pessoa do rascunho com os dados derivados usados pelas regras. */
export interface PessoaResolvida {
  key: PessoaKey;
  nome: string;
  idade: number;
  casado: boolean;
  vinculo: "principal" | "conjuge" | "filho";
}
