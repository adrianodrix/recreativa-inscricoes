import { describe, expect, it } from "vitest";
import { normalizarNome, validarNomeCompleto } from "./nome";

describe("normalizarNome", () => {
  it("ignora acentos, maiúsculas e espaços extras", () => {
    expect(normalizarNome("  João   da Silva ")).toBe("joao da silva");
    expect(normalizarNome("JOÃO DA SILVA")).toBe("joao da silva");
  });
});

describe("validarNomeCompleto", () => {
  it("aceita nome e sobrenome com 10+ caracteres", () => {
    expect(validarNomeCompleto("Maria Souza")).toBeNull();
  });

  it("rejeita nomes curtos, com números ou com uma palavra só", () => {
    expect(validarNomeCompleto("Ana Li")).toBe("curto");
    expect(validarNomeCompleto("Maria Souza 2")).toBe("numeros");
    expect(validarNomeCompleto("Maximiliano")).toBe("incompleto");
  });
});
