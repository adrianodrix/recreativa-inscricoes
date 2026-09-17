/*
 * Em que fase a página inicial mostra o evento (P5/P7): antes de abrir as
 * inscrições, com elas abertas, encerradas ou com o evento já realizado.
 * Puro: a página pública (que recebe o motivo pronto da RPC) e a prévia do
 * painel (que calcula o motivo com statusInscricoes) usam o mesmo cálculo.
 */
import { instanteDoEvento } from "@/lib/datas";
import type { MotivoFechado } from "@/lib/eventos/status";

export interface EventoParaFase {
  data_evento: string; // "2026-02-22"
  hora_fim: string; // "18:30" ou "18:30:00"
  /* Nulo = inscrições abertas. */
  motivo_fechado: MotivoFechado | null;
}

export type Fase =
  | { fase: "em_breve" }
  | { fase: "abertas" }
  | { fase: "encerradas"; motivo: MotivoFechado }
  | { fase: "realizado" };

/* O evento é "realizado" a partir do horário de término, no fuso de Brasília. */
export function faseDaPagina(evento: EventoParaFase, agora: Date = new Date()): Fase {
  if (agora >= instanteDoEvento(evento.data_evento, evento.hora_fim)) return { fase: "realizado" };
  if (evento.motivo_fechado === null) return { fase: "abertas" };
  if (evento.motivo_fechado === "antes_do_periodo") return { fase: "em_breve" };
  return { fase: "encerradas", motivo: evento.motivo_fechado };
}
