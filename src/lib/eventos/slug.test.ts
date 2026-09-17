import { describe, expect, it } from "vitest";
import { gerarSlug, slugValido } from "./slug";

describe("gerarSlug", () => {
  it("converte o nome em slug limpo", () => {
    expect(gerarSlug("Recreativa 2026")).toBe("recreativa-2026");
    expect(gerarSlug("  Edição Especial: Família & Fé!  ")).toBe("edicao-especial-familia-fe");
  });
});

describe("slugValido", () => {
  it("aceita slugs limpos e rejeita reservados ou mal formados", () => {
    expect(slugValido("recreativa-2026")).toBe(true);
    expect(slugValido("painel")).toBe(false);
    expect(slugValido("-abc")).toBe(false);
    expect(slugValido("Abc")).toBe(false);
  });
});
