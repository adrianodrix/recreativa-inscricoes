import { describe, expect, it } from "vitest";
import { montarEtapas } from "./etapas";
import { eventoFixture, familia, solteiro35 } from "./fixtures";
import { paiMaeDisponivel, pessoasDoDraft, responsavelBloqueado } from "./regras";
import { montarPayload } from "./payload";
import { etapaDoErro } from "./erros";
import { normalizarWhatsapp } from "./validacoes";

const evento = eventoFixture();
const ids = (d: Parameters<typeof montarEtapas>[0]) => montarEtapas(d, evento).map((e) => e.id);

describe("montarEtapas", () => {
  it("abre sempre pelas boas-vindas, mesmo sem texto cadastrado", () => {
    expect(ids(solteiro35)[0]).toBe("boas_vindas");
  });

  it("solteiro de 35 anos: pergunta casado, não tem brincadeiras nem WhatsApp", () => {
    expect(ids(solteiro35)).toEqual(["boas_vindas", "nome", "apelido", "nascimento", "casado", "comida:principal", "resumo"]);
  });

  it("antes de responder o nascimento só mostra as etapas iniciais", () => {
    expect(ids({ ...solteiro35, principal: { nome: "", nascimento: "" } })).toEqual(["boas_vindas", "nome", "apelido", "nascimento", "resumo"]);
  });

  it("família: cônjuge, 3 filhos, papel, comida para > 12, brincadeiras por categoria e WhatsApp", () => {
    const lista = ids({ ...familia, participacoes: [{ brincadeiraId: "c0000000-0000-0000-0000-00000000000c", casal: true }] });
    expect(lista.slice(0, 6)).toEqual(["boas_vindas", "nome", "apelido", "nascimento", "casado", "conjuge_opcao"]);
    expect(lista).toContain("conjuge_dados");
    expect(lista.filter((i) => i.startsWith("filho_dados:"))).toHaveLength(3);
    expect(lista).toContain("papel");
    // Pedro (5) e Ana (10) não passam por comida; Lucas (16) sim.
    expect(lista.filter((i) => i.startsWith("comida:"))).toEqual(["comida:principal", "comida:conjuge", "comida:filho:2"]);
    // Pedro (5) → crianças; Ana (10) e Lucas (16) → jovens; pais não entram em crianças/jovens.
    expect(lista.filter((i) => i.startsWith("brincadeira:"))).toEqual([
      "brincadeira:a0000000-0000-0000-0000-00000000000a:filho:0",
      "brincadeira:b0000000-0000-0000-0000-00000000000b:filho:1",
      "brincadeira:b0000000-0000-0000-0000-00000000000b:filho:2",
    ]);
    expect(lista).toContain("casal:c0000000-0000-0000-0000-00000000000c");
    expect(lista).toContain("pais_filhos:d0000000-0000-0000-0000-00000000000d");
    expect(lista.slice(-2)).toEqual(["whatsapp", "resumo"]);
  });

  it("sem cônjuge no fluxo não oferece brincadeiras de casais", () => {
    const lista = ids({ ...familia, conjugeOpcao: "vai_se_cadastrar", conjuge: undefined });
    expect(lista.some((i) => i.startsWith("casal:"))).toBe(false);
    expect(lista).not.toContain("conjuge_dados");
  });
});

describe("regras de dupla", () => {
  const pf = "d0000000-0000-0000-0000-00000000000d";

  it("pai só acompanha um filho por brincadeira", () => {
    const d = { ...familia, participacoes: [{ brincadeiraId: pf, filho: "filho:0" as const, parceiro: { tipo: "pai_mae" as const, pessoa: "principal" as const, papel: "pai" as const } }] };
    expect(paiMaeDisponivel(d, pf, "filho:1", "principal")).toBe(false);
    expect(paiMaeDisponivel(d, pf, "filho:1", "conjuge")).toBe(true);
    expect(paiMaeDisponivel(d, pf, "filho:0", "principal")).toBe(true);
  });

  it("responsável vinculado a um irmão fica bloqueado para os demais", () => {
    const d = { ...familia, participacoes: [{ brincadeiraId: pf, filho: "filho:0" as const, parceiro: { tipo: "responsavel" as const, inscritoId: "r1", nome: "Rafa", apelido: null } }] };
    expect(responsavelBloqueado(d, "r1", "filho:1")).toBe(true);
    expect(responsavelBloqueado(d, "r1", "filho:0")).toBe(false);
    expect(responsavelBloqueado(d, "r2", "filho:1")).toBe(false);
  });
});

describe("montarPayload", () => {
  it("monta o contrato da RPC só com o que está visível", () => {
    const d = {
      ...familia,
      conjugeOpcao: "nao_cadastrar" as const,
      participacoes: [
        { brincadeiraId: "c0000000-0000-0000-0000-00000000000c", casal: true as const },
        { brincadeiraId: "a0000000-0000-0000-0000-00000000000a", pessoa: "filho:0" as const },
        { brincadeiraId: "d0000000-0000-0000-0000-00000000000d", filho: "filho:1" as const, parceiro: { tipo: "pai_mae" as const, pessoa: "principal" as const, papel: "pai" as const } },
      ],
    };
    const p = montarPayload(d, evento);
    expect(p.conjuge).toBeUndefined();
    expect(p.principal.conjuge_situacao).toBe("nao_quer_cadastrar");
    expect(p.principal.comida).toBe("salgado");
    expect(p.filhos.map((f) => f.ref)).toEqual(["f1", "f2", "f3"]);
    expect(p.filhos[2].comida).toBe("suco");
    expect(p.participacoes).toEqual([
      { tipo: "pessoa", brincadeira_id: "a0000000-0000-0000-0000-00000000000a", pessoa: "f1" },
      { tipo: "dupla", brincadeira_id: "d0000000-0000-0000-0000-00000000000d", filho: "f2", parceiro: "principal", papel: "pai" },
    ]);
    expect(p.principal.whatsapp).toBe("5511999990000");
    expect(pessoasDoDraft(d, evento).map((x) => x.idade)).toEqual([41, 5, 10, 16]);
  });

  it('"não vou contribuir" não vira colaboração de comida', () => {
    const p = montarPayload({ ...familia, comida: { principal: "nenhuma", conjuge: "doce" } }, evento);
    expect(p.principal.comida).toBeUndefined();
    expect(p.conjuge?.comida).toBe("doce");
  });
});

describe("etapaDoErro", () => {
  const etapas = montarEtapas({ ...familia, participacoes: [{ brincadeiraId: "a0000000-0000-0000-0000-00000000000a", pessoa: "filho:0" }] }, evento);
  it("leva ao passo certo conforme o código e a referência", () => {
    expect(etapaDoErro({ codigo: "nome_duplicado", detalhe: { ref: "f2" } }, etapas)).toBe("filho_dados:1");
    expect(etapaDoErro({ codigo: "estoque_comida", detalhe: { ref: "conjuge" } }, etapas)).toBe("comida:conjuge");
    expect(etapaDoErro({ codigo: "brincadeira_lotada", detalhe: { brincadeira_id: "a0000000-0000-0000-0000-00000000000a" } }, etapas)).toBe("brincadeira:a0000000-0000-0000-0000-00000000000a:filho:0");
    expect(etapaDoErro({ codigo: "inscricoes_fechadas", detalhe: {} }, etapas)).toBe("resumo");
    expect(etapaDoErro({ codigo: "whatsapp_obrigatorio", detalhe: {} }, etapas)).toBe("whatsapp");
  });
});

describe("normalizarWhatsapp", () => {
  it("aceita formatos comuns e rejeita inválidos", () => {
    expect(normalizarWhatsapp("(11) 99999-9999")).toBe("5511999999999");
    expect(normalizarWhatsapp("+55 21 98888-7777")).toBe("5521988887777");
    expect(normalizarWhatsapp("1133334444")).toBe("551133334444");
    expect(normalizarWhatsapp("999")).toBeNull();
    expect(normalizarWhatsapp("(11) 89999-9999")).toBeNull();
  });
});
