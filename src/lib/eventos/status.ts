/*
 * Status efetivo das inscrições (V7): abertas somente se a chave manual está
 * ligada, o momento está dentro do período e o total de inscritos é menor que o limite.
 * Puro: usado no formulário público e no painel.
 */
export type MotivoFechado = "nao_publicado" | "manual" | "antes_do_periodo" | "periodo_encerrado" | "limite";

export interface EventoParaStatus {
  /* Evento em preparação não recebe inscrição pelo formulário público (P6). */
  publicado: boolean;
  aberto_manual: boolean;
  inscricoes_inicio: string; // ISO timestamptz
  inscricoes_fim: string; // ISO timestamptz
  limite_inscritos: number;
}

export type StatusInscricoes =
  | { aberto: true; motivo: null }
  | { aberto: false; motivo: MotivoFechado };

export function statusInscricoes(
  evento: EventoParaStatus,
  totalInscritos: number,
  agora: Date = new Date(),
): StatusInscricoes {
  if (!evento.publicado) return { aberto: false, motivo: "nao_publicado" };
  if (!evento.aberto_manual) return { aberto: false, motivo: "manual" };
  const inicio = new Date(evento.inscricoes_inicio);
  const fim = new Date(evento.inscricoes_fim);
  if (agora < inicio) return { aberto: false, motivo: "antes_do_periodo" };
  if (agora >= fim) return { aberto: false, motivo: "periodo_encerrado" };
  if (totalInscritos >= evento.limite_inscritos) return { aberto: false, motivo: "limite" };
  return { aberto: true, motivo: null };
}

export const ROTULO_MOTIVO: Record<MotivoFechado, string> = {
  nao_publicado: "Evento em preparação",
  manual: "Encerradas pelo organizador",
  antes_do_periodo: "Ainda não abriram",
  periodo_encerrado: "Período de inscrições encerrado",
  limite: "Limite de inscritos atingido",
};
