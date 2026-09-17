/* Módulo puro de montagem de times: sem React, sem banco. */
export type CategoriaTime = "crianca" | "jovem";

export interface PessoaTime {
  id: string;
  nome: string;
  idade: number;
  categoria: CategoriaTime;
  /* Inscrito principal, só para filhos (irmãos = mesmo familiaId). */
  familiaId: string | null;
}

/* Dupla de pais e filhos com responsável (T14): criança e responsável ficam no mesmo time. */
export interface VinculoResponsavel {
  criancaId: string;
  responsavelId: string;
}

export interface TimeDef {
  id: string;
  nome: string;
}

export interface EntradaMontagem {
  pessoas: PessoaTime[];
  vinculos: VinculoResponsavel[];
  times: TimeDef[];
  semente?: number;
}

/* inscritoId -> timeId */
export type Alocacao = Record<string, string>;

export interface Unidade {
  membros: PessoaTime[];
  familias: Set<string>;
}

export type ErroMontagem =
  | { codigo: "TIMES_INSUFICIENTES"; encontrados: number }
  | { codigo: "SEM_ELEGIVEIS" }
  | { codigo: "IRMAOS_NA_MESMA_UNIDADE"; conflitos: PessoaTime[][] };

export interface AvisoMontagem {
  tipo: "irmaos_juntos" | "responsavel_separado" | "desbalanceado";
  pessoas: string[];
  timeId?: string;
  mensagem: string;
}

export type ResultadoMontagem =
  | { ok: true; alocacao: Alocacao; semente: number; avisos: AvisoMontagem[] }
  | { ok: false; erro: ErroMontagem };
