import { diasAte, emDias } from "@/lib/datas";
import type { StatusInscricoes } from "./status";

export interface SituacaoEvento {
  status: StatusInscricoes;
  inscricoes_inicio: string;
  inscricoes_fim: string;
  data_evento: string;
  /* Times cadastrados, se algum já tem membros e o estado da montagem. */
  times: number;
  montados: boolean;
  montagem_status: "rascunho" | "confirmado";
  /* Crianças e jovens inscritos: só eles entram nos times. */
  elegiveis: number;
}

/* O que o organizador precisa fazer agora, pela fase em que o evento está. Puro. */
export function proximoPasso(s: SituacaoEvento, agora: Date = new Date()): string {
  const diasEvento = diasAte(s.data_evento, agora);
  if (diasEvento < 0) return "Evento realizado.";
  if (s.status.aberto) return `Inscrições encerram ${emDias(diasAte(s.inscricoes_fim, agora))}.`;
  if (s.status.motivo === "antes_do_periodo") return `Inscrições abrem ${emDias(diasAte(s.inscricoes_inicio, agora))}.`;
  if (s.elegiveis === 0) return "Inscrições encerradas. Sem crianças ou jovens, não há times a montar.";
  if (s.times < 2) return "Inscrições encerradas: cadastre pelo menos 2 times para montar.";
  if (!s.montados) return "Inscrições encerradas: monte os times.";
  if (s.montagem_status === "rascunho") return "Times montados: confirme a montagem para avisar as famílias.";
  return `Montagem confirmada. Evento ${emDias(diasEvento)}.`;
}
