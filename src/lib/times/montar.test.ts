import { describe, expect, it } from "vitest";
import { avaliarAlocacao } from "./avaliar";
import { calcularAfetados } from "./diff";
import { gerarPessoas, QUATRO_TIMES } from "./fixtures";
import { montarTimes } from "./montar";
import type { Alocacao, PessoaTime } from "./tipos";

function contar(alocacao: Alocacao, pessoas: PessoaTime[], timeId: string, categoria: PessoaTime["categoria"]) {
  return pessoas.filter((p) => alocacao[p.id] === timeId && p.categoria === categoria);
}

describe("montarTimes", () => {
  it("4 times com 30 crianças e 20 jovens: contagens ±1 e idades equilibradas", () => {
    const pessoas = gerarPessoas(30, 20);
    const r = montarTimes({ pessoas, vinculos: [], times: QUATRO_TIMES, semente: 42 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const criancas = QUATRO_TIMES.map((t) => contar(r.alocacao, pessoas, t.id, "crianca").length);
    const jovens = QUATRO_TIMES.map((t) => contar(r.alocacao, pessoas, t.id, "jovem").length);
    expect(Math.max(...criancas) - Math.min(...criancas)).toBeLessThanOrEqual(1);
    expect(Math.max(...jovens) - Math.min(...jovens)).toBeLessThanOrEqual(1);
    expect(jovens).toEqual([5, 5, 5, 5]);
    const medias = QUATRO_TIMES.map((t) => {
      const c = contar(r.alocacao, pessoas, t.id, "crianca");
      return c.reduce((s, p) => s + p.idade, 0) / c.length;
    });
    expect(Math.max(...medias) - Math.min(...medias)).toBeLessThanOrEqual(2);
    expect(Object.keys(r.alocacao)).toHaveLength(50);
  });

  it("irmãos ficam em times diferentes", () => {
    const pessoas = gerarPessoas(12, 0); // pares de irmãos fam0..fam5
    const r = montarTimes({ pessoas, vinculos: [], times: QUATRO_TIMES, semente: 7 });
    if (!r.ok) throw new Error("falhou");
    for (let i = 0; i < 12; i += 2) expect(r.alocacao[`c${i}`]).not.toBe(r.alocacao[`c${i + 1}`]);
    expect(r.avisos).toHaveLength(0);
  });

  it("responsável de duas crianças de famílias diferentes fica com as duas no mesmo time", () => {
    const pessoas = gerarPessoas(8, 4);
    const vinculos = [
      { criancaId: "c0", responsavelId: "j1" },
      { criancaId: "c2", responsavelId: "j1" },
    ];
    const r = montarTimes({ pessoas, vinculos, times: QUATRO_TIMES, semente: 3 });
    if (!r.ok) throw new Error("falhou");
    expect(r.alocacao.c0).toBe(r.alocacao.j1);
    expect(r.alocacao.c2).toBe(r.alocacao.j1);
  });

  it("responsável vinculado a dois irmãos gera erro estruturado", () => {
    const pessoas = gerarPessoas(4, 2);
    const vinculos = [
      { criancaId: "c0", responsavelId: "j1" },
      { criancaId: "c1", responsavelId: "j1" }, // c0 e c1 são irmãos (fam0)
    ];
    const r = montarTimes({ pessoas, vinculos, times: QUATRO_TIMES, semente: 1 });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro.codigo).toBe("IRMAOS_NA_MESMA_UNIDADE");
    if (r.erro.codigo === "IRMAOS_NA_MESMA_UNIDADE") {
      expect(r.erro.conflitos[0].map((p) => p.id).sort()).toEqual(["c0", "c1"]);
    }
  });

  it("exige pelo menos 2 times e alguém elegível", () => {
    expect(montarTimes({ pessoas: gerarPessoas(2, 0), vinculos: [], times: [QUATRO_TIMES[0]] })).toMatchObject({ ok: false, erro: { codigo: "TIMES_INSUFICIENTES" } });
    expect(montarTimes({ pessoas: [], vinculos: [], times: QUATRO_TIMES })).toMatchObject({ ok: false, erro: { codigo: "SEM_ELEGIVEIS" } });
  });

  it("mesma semente reproduz; sementes diferentes variam", () => {
    const pessoas = gerarPessoas(20, 10);
    const a = montarTimes({ pessoas, vinculos: [], times: QUATRO_TIMES, semente: 99 });
    const b = montarTimes({ pessoas, vinculos: [], times: QUATRO_TIMES, semente: 99 });
    const c = montarTimes({ pessoas, vinculos: [], times: QUATRO_TIMES, semente: 100 });
    if (!a.ok || !b.ok || !c.ok) throw new Error("falhou");
    expect(a.alocacao).toEqual(b.alocacao);
    expect(a.alocacao).not.toEqual(c.alocacao);
  });
});

describe("avaliarAlocacao", () => {
  it("detecta irmãos juntos, responsável separado e desbalanceamento", () => {
    const pessoas = gerarPessoas(4, 2);
    const vinculos = [{ criancaId: "c2", responsavelId: "j0" }];
    const alocacao: Alocacao = { c0: "t1", c1: "t1", c2: "t2", c3: "t2", j0: "t3", j1: "t3" };
    const avisos = avaliarAlocacao({ pessoas, vinculos, times: QUATRO_TIMES }, alocacao);
    expect(avisos.map((a) => a.tipo).sort()).toEqual(["desbalanceado", "irmaos_juntos", "irmaos_juntos", "responsavel_separado"]);
  });
});

describe("calcularAfetados", () => {
  it("inclui quem mudou e os vínculos de quem mudou", () => {
    const pessoas = gerarPessoas(3, 2);
    const vinculos = [{ criancaId: "c0", responsavelId: "j0" }];
    const anterior: Alocacao = { c0: "t1", c1: "t2", c2: "t3", j0: "t1", j1: "t2" };
    const atual: Alocacao = { c0: "t2", c1: "t2", c2: "t3", j0: "t2", j1: "t1" };
    expect(calcularAfetados(anterior, atual, pessoas, vinculos).sort()).toEqual(["c0", "j0", "j1"]);
  });
});
