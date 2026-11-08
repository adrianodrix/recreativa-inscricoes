import { describe, expect, it } from "vitest";
import { lerSituacaoNome, removerFilho, seguirSemConjuge, seguirSemFilho } from "./dependentes";
import { montarEtapas, proximaEtapa } from "./etapas";
import { eventoFixture, familia } from "./fixtures";
import { montarPayload } from "./payload";
import type { InscricaoDraft } from "./tipos";

const evento = eventoFixture();
const CRIANCAS = "a0000000-0000-0000-0000-00000000000a";
const JOVENS = "b0000000-0000-0000-0000-00000000000b";
const CASAIS = "c0000000-0000-0000-0000-00000000000c";
const PAIS_FILHOS = "d0000000-0000-0000-0000-00000000000d";

/* Família com respostas em todos os filhos, para conferir a renumeração. */
const respondida: InscricaoDraft = {
  ...familia,
  comida: { principal: "salgado", conjuge: "doce", "filho:1": "nenhuma", "filho:2": "suco" },
  participacoes: [
    { brincadeiraId: CRIANCAS, pessoa: "filho:0" },
    { brincadeiraId: JOVENS, pessoa: "filho:2" },
    { brincadeiraId: CASAIS, casal: true },
    { brincadeiraId: PAIS_FILHOS, filho: "filho:2", parceiro: { tipo: "pai_mae", pessoa: "principal", papel: "pai" } },
  ],
  recusadas: [`brincadeira:${JOVENS}:filho:1`, `casal:${CASAIS}`],
};

describe("lerSituacaoNome", () => {
  it("aceita só os valores da RPC; qualquer outra coisa conta como livre", () => {
    expect(lerSituacaoNome("principal")).toBe("principal");
    expect(lerSituacaoNome("familiar")).toBe("familiar");
    expect(lerSituacaoNome("livre")).toBe("livre");
    expect(lerSituacaoNome(null)).toBe("livre");
    expect(lerSituacaoNome(true)).toBe("livre");
  });
});

describe("seguirSemConjuge", () => {
  it("marca que o cônjuge se inscreve por conta própria e tira ele do payload", () => {
    const d = seguirSemConjuge(respondida);
    expect(d.conjugeOpcao).toBe("vai_se_cadastrar");
    expect(d.conjuge).toBeUndefined();
    const payload = montarPayload(d, evento);
    expect(payload.conjuge).toBeUndefined();
    expect(payload.principal.conjuge_situacao).toBe("vai_se_cadastrar");
    expect(payload.participacoes.some((p) => p.tipo === "casal")).toBe(false);
  });
});

describe("removerFilho", () => {
  it("tira o filho e as respostas dele, e renumera as dos filhos seguintes", () => {
    const d = removerFilho(respondida, 1);
    expect(d.filhos.map((f) => f.nome)).toEqual(["Pedro da Silva", "Lucas da Silva"]);
    expect(d.comida).toEqual({ principal: "salgado", conjuge: "doce", "filho:1": "suco" });
    expect(d.participacoes).toEqual([
      { brincadeiraId: CRIANCAS, pessoa: "filho:0" },
      { brincadeiraId: JOVENS, pessoa: "filho:1" },
      { brincadeiraId: CASAIS, casal: true },
      { brincadeiraId: PAIS_FILHOS, filho: "filho:1", parceiro: { tipo: "pai_mae", pessoa: "principal", papel: "pai" } },
    ]);
    expect(d.recusadas).toEqual([`casal:${CASAIS}`]);
  });

  it("remove participações em que o filho tirado era o participante", () => {
    const d = removerFilho(respondida, 2);
    expect(d.participacoes.filter((p) => !("casal" in p))).toEqual([{ brincadeiraId: CRIANCAS, pessoa: "filho:0" }]);
    expect(d.comida["filho:2"]).toBeUndefined();
  });
});

describe("seguirSemFilho", () => {
  it("com outros filhos, mantém a opção de cadastrar", () => {
    expect(seguirSemFilho(respondida, 0).filhosOpcao).toBe("sim");
  });

  it("sem filhos restantes, a opção vira 'vão se inscrever'", () => {
    const umFilho: InscricaoDraft = { ...familia, filhos: [familia.filhos[0]], comida: {}, participacoes: [] };
    const d = seguirSemFilho(umFilho, 0);
    expect(d.filhos).toEqual([]);
    expect(d.filhosOpcao).toBe("vai_se_cadastrar");
    expect(montarPayload(d, evento).principal.filhos_situacao).toBe("vai_se_cadastrar");
  });
});

describe("proximaEtapa", () => {
  const etapas = (d: InscricaoDraft) => montarEtapas(d, evento);

  it("avança normalmente quando a etapa atual continua na lista", () => {
    expect(proximaEtapa(etapas(familia), "nome", etapas(familia)).id).toBe("apelido");
  });

  it("cônjuge já inscrito: a etapa dos dados some e o fluxo segue para os filhos, não para o início", () => {
    expect(proximaEtapa(etapas(familia), "conjuge_dados", etapas(seguirSemConjuge(familia))).id).toBe("filhos_tem");
  });

  it("único filho já inscrito: segue para a etapa seguinte que ainda existe", () => {
    const umFilho: InscricaoDraft = { ...familia, filhos: [familia.filhos[2]] };
    const novas = etapas(seguirSemFilho(umFilho, 0));
    expect(proximaEtapa(etapas(umFilho), "filho_dados:0", novas).id).toBe("comida:principal");
  });

  it("filho do meio já inscrito: segue para a pergunta de mais um filho", () => {
    expect(proximaEtapa(etapas(familia), "filho_dados:1", etapas(seguirSemFilho(familia, 1))).id).toBe("filho_mais:1");
  });
});
