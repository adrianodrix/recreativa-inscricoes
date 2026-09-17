import type { PessoaTime } from "./tipos";

export interface EstadoTime {
  timeId: string;
  criancas: number;
  jovens: number;
  somaIdadeCriancas: number;
  somaIdadeJovens: number;
  familias: Set<string>;
}

export function estadoVazio(timeId: string): EstadoTime {
  return { timeId, criancas: 0, jovens: 0, somaIdadeCriancas: 0, somaIdadeJovens: 0, familias: new Set() };
}

export function adicionar(estado: EstadoTime, pessoas: PessoaTime[]): EstadoTime {
  const novo = { ...estado, familias: new Set(estado.familias) };
  for (const p of pessoas) {
    if (p.categoria === "crianca") {
      novo.criancas += 1;
      novo.somaIdadeCriancas += p.idade;
    } else {
      novo.jovens += 1;
      novo.somaIdadeJovens += p.idade;
    }
    if (p.familiaId) novo.familias.add(p.familiaId);
  }
  return novo;
}

const media = (soma: number, n: number) => (n === 0 ? 0 : soma / n);
const amplitude = (valores: number[]) => (valores.length ? Math.max(...valores) - Math.min(...valores) : 0);

/*
 * Custo do desequilíbrio (T3/T15): a contagem por categoria domina (garante ±1);
 * a média de idade só desempata.
 */
export function custo(estados: EstadoTime[]): number {
  const comCriancas = estados.filter((e) => e.criancas > 0);
  const comJovens = estados.filter((e) => e.jovens > 0);
  return (
    1000 * amplitude(estados.map((e) => e.criancas)) +
    1000 * amplitude(estados.map((e) => e.jovens)) +
    amplitude(comCriancas.map((e) => media(e.somaIdadeCriancas, e.criancas))) +
    amplitude(comJovens.map((e) => media(e.somaIdadeJovens, e.jovens)))
  );
}
