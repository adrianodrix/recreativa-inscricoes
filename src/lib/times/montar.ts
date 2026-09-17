import { adicionar, custo, estadoVazio, type EstadoTime } from "./pontuacao";
import { criarRng, embaralhar, novaSemente } from "./rng";
import type { Alocacao, AvisoMontagem, EntradaMontagem, ResultadoMontagem, Unidade } from "./tipos";
import { conflitosDeIrmaos, montarUnidades } from "./unidades";

/*
 * Distribui unidades (criança + responsáveis) pelos times de forma gulosa e balanceada:
 * cada unidade vai para o time que deixa o conjunto menos desequilibrado, evitando
 * times que já tenham um irmão de alguém da unidade. Determinística pela semente.
 */
export function montarTimes(entrada: EntradaMontagem): ResultadoMontagem {
  if (entrada.times.length < 2) return { ok: false, erro: { codigo: "TIMES_INSUFICIENTES", encontrados: entrada.times.length } };
  if (entrada.pessoas.length === 0) return { ok: false, erro: { codigo: "SEM_ELEGIVEIS" } };

  const unidades = montarUnidades(entrada.pessoas, entrada.vinculos);
  const conflitos = conflitosDeIrmaos(unidades);
  if (conflitos.length > 0) return { ok: false, erro: { codigo: "IRMAOS_NA_MESMA_UNIDADE", conflitos } };

  const semente = entrada.semente ?? novaSemente();
  const rng = criarRng(semente);
  const ordenadas = embaralhar(unidades, rng).sort(
    (a, b) => b.membros.length - a.membros.length || idadeMaxima(b) - idadeMaxima(a),
  );

  let estados = entrada.times.map((t) => estadoVazio(t.id));
  const alocacao: Alocacao = {};
  const avisos: AvisoMontagem[] = [];

  for (const unidade of ordenadas) {
    const livres = estados.filter((e) => ![...unidade.familias].some((f) => e.familias.has(f)));
    const candidatos = livres.length > 0 ? livres : estados;
    if (livres.length === 0) {
      avisos.push({
        tipo: "irmaos_juntos",
        pessoas: unidade.membros.map((m) => m.id),
        mensagem: `Não há time sem irmão para ${unidade.membros.map((m) => m.nome).join(", ")}.`,
      });
    }
    const escolhido = melhorTime(estados, candidatos, unidade, rng);
    estados = estados.map((e) => (e.timeId === escolhido ? adicionar(e, unidade.membros) : e));
    for (const m of unidade.membros) alocacao[m.id] = escolhido;
  }

  return { ok: true, alocacao, semente, avisos };
}

function idadeMaxima(u: Unidade): number {
  return Math.max(...u.membros.map((m) => m.idade));
}

/* Menor custo após simular a adição; empates decididos pelo sorteio semeado. */
function melhorTime(estados: EstadoTime[], candidatos: EstadoTime[], unidade: Unidade, rng: () => number): string {
  let melhores: string[] = [];
  let menor = Number.POSITIVE_INFINITY;
  for (const c of candidatos) {
    const simulado = estados.map((e) => (e.timeId === c.timeId ? adicionar(e, unidade.membros) : e));
    const valor = custo(simulado);
    if (valor < menor - 1e-9) {
      menor = valor;
      melhores = [c.timeId];
    } else if (Math.abs(valor - menor) <= 1e-9) {
      melhores.push(c.timeId);
    }
  }
  return melhores[Math.floor(rng() * melhores.length)];
}
