/* Programação do dia (P9): resumo do destaque e horários para leitura. Puro. */

export interface ItemProgramacao {
  id: string;
  hora_inicio: string; // "13:00" ou "13:00:00"
  hora_fim: string | null;
  titulo: string;
  detalhe: string | null;
  destaque: boolean;
  brincadeira: string | null;
}

/* "13:00" → "13h"; "14:30" → "14h30" */
function hora(valor: string): string {
  const [h, m] = valor.split(":");
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/* "13h – 14h" quando há fim; só o início quando não há. */
export function faixaHorario(inicio: string, fim: string | null): string {
  return fim ? `${hora(inicio)} – ${hora(fim)}` : hora(inicio);
}

/*
 * O "dia resumido" mostra poucos momentos: os marcados como destaque ou, se
 * nenhum foi marcado, os primeiros da lista (que já vem ordenada por horário).
 */
export function resumoDoDia(itens: readonly ItemProgramacao[], maximo = 4): ItemProgramacao[] {
  const destacados = itens.filter((i) => i.destaque);
  return (destacados.length > 0 ? destacados : itens).slice(0, maximo);
}
