import { adicionar, estadoVazio } from "./pontuacao";
import type { Alocacao, AvisoMontagem, EntradaMontagem } from "./tipos";
import { saoIrmaos } from "./unidades";

/* Avisos não bloqueantes para o quadro de edição manual (T6, item 7 do algoritmo). */
export function avaliarAlocacao(entrada: EntradaMontagem, alocacao: Alocacao): AvisoMontagem[] {
  const avisos: AvisoMontagem[] = [];
  const porId = new Map(entrada.pessoas.map((p) => [p.id, p]));
  const alocadas = entrada.pessoas.filter((p) => alocacao[p.id]);

  for (const time of entrada.times) {
    const membros = alocadas.filter((p) => alocacao[p.id] === time.id);
    for (let i = 0; i < membros.length; i++) {
      for (let j = i + 1; j < membros.length; j++) {
        if (saoIrmaos(membros[i], membros[j])) {
          avisos.push({
            tipo: "irmaos_juntos",
            pessoas: [membros[i].id, membros[j].id],
            timeId: time.id,
            mensagem: `${membros[i].nome} e ${membros[j].nome} são irmãos e estão no mesmo time (${time.nome}).`,
          });
        }
      }
    }
  }

  for (const v of entrada.vinculos) {
    const a = alocacao[v.criancaId];
    const b = alocacao[v.responsavelId];
    if (a && b && a !== b) {
      const crianca = porId.get(v.criancaId);
      const resp = porId.get(v.responsavelId);
      avisos.push({
        tipo: "responsavel_separado",
        pessoas: [v.criancaId, v.responsavelId],
        mensagem: `${resp?.nome ?? "Responsável"} acompanha ${crianca?.nome ?? "uma criança"} e estão em times diferentes.`,
      });
    }
  }

  const estados = entrada.times.map((t) => {
    const membros = alocadas.filter((p) => alocacao[p.id] === t.id);
    return adicionar(estadoVazio(t.id), membros);
  });
  const amplitude = (v: number[]) => Math.max(...v) - Math.min(...v);
  if (estados.length > 1 && (amplitude(estados.map((e) => e.criancas)) > 1 || amplitude(estados.map((e) => e.jovens)) > 1)) {
    avisos.push({
      tipo: "desbalanceado",
      pessoas: [],
      mensagem: "Os times estão desbalanceados: diferença maior que 1 em crianças ou jovens.",
    });
  }
  return avisos;
}
