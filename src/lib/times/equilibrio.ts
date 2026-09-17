import type { NivelOcupacao } from "@/components/painel/Ocupacao";

export interface EquilibrioTime {
  /* Tamanho esperado de cada time: elegíveis divididos igualmente (arredondado para cima). */
  cota: number;
  nivel: NivelOcupacao;
  legenda: string;
}

/*
 * Como um time está em relação aos outros (T3: diferença máxima de 1 pessoa).
 * `contagens` são os membros de todos os times, incluindo este.
 */
export function equilibrioDoTime(membros: number, contagens: number[], elegiveis: number): EquilibrioTime {
  const cota = contagens.length > 0 ? Math.ceil(elegiveis / contagens.length) : 0;
  const maior = Math.max(0, ...contagens);
  const menor = Math.min(...contagens);
  if (maior === 0) return { cota, nivel: "normal", legenda: "Sem membros ainda" };
  if (maior - menor <= 1) return { cota, nivel: "ok", legenda: "Equilibrado" };
  if (membros === maior) return { cota, nivel: "critico", legenda: `${membros - menor} a mais que o menor time` };
  if (membros === menor) return { cota, nivel: "atencao", legenda: `${maior - membros} a menos que o maior time` };
  return { cota, nivel: "ok", legenda: "Equilibrado" };
}
