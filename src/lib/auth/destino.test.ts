import { describe, expect, it } from "vitest";
import { destinoSeguro } from "./destino";

describe("destinoSeguro", () => {
  it("aceita caminhos do painel e rejeita externos", () => {
    expect(destinoSeguro("/painel/eventos/abc")).toBe("/painel/eventos/abc");
    expect(destinoSeguro("https://evil.com")).toBe("/painel/eventos");
    expect(destinoSeguro("//evil.com")).toBe("/painel/eventos");
    expect(destinoSeguro("/outra")).toBe("/painel/eventos");
    expect(destinoSeguro(null)).toBe("/painel/eventos");
  });
});
