import type { PessoaTime, TimeDef } from "./tipos";

export const QUATRO_TIMES: TimeDef[] = [
  { id: "t1", nome: "Time 1" },
  { id: "t2", nome: "Time 2" },
  { id: "t3", nome: "Time 3" },
  { id: "t4", nome: "Time 4" },
];

/* Gera pessoas determinísticas: idades espalhadas, famílias com 1–3 filhos. */
export function gerarPessoas(criancas: number, jovens: number): PessoaTime[] {
  const lista: PessoaTime[] = [];
  for (let i = 0; i < criancas; i++) {
    lista.push({ id: `c${i}`, nome: `Criança ${i}`, idade: 3 + (i % 6), categoria: "crianca", familiaId: `fam${Math.floor(i / 2)}` });
  }
  for (let i = 0; i < jovens; i++) {
    lista.push({ id: `j${i}`, nome: `Jovem ${i}`, idade: 9 + (i % 22), categoria: "jovem", familiaId: i % 3 === 0 ? `fam${i}` : null });
  }
  return lista;
}
