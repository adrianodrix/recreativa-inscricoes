import { describe, expect, it } from "vitest";
import { calcularIdade, dataIsoValida } from "./idade";

describe("calcularIdade", () => {
  it("conta a idade completa na data de referência", () => {
    expect(calcularIdade("2018-05-10", "2026-05-09")).toBe(7);
    expect(calcularIdade("2018-05-10", "2026-05-10")).toBe(8);
    expect(calcularIdade("2018-05-10", "2026-05-11")).toBe(8);
  });

  it("considera quem faz aniversário entre a inscrição e o evento", () => {
    expect(calcularIdade("2017-11-20", "2026-09-16")).toBe(8);
    expect(calcularIdade("2017-11-20", "2026-11-21")).toBe(9);
  });

  it("rejeita datas inválidas", () => {
    expect(() => calcularIdade("2018-02-31", "2026-01-01")).toThrow();
  });
});

describe("dataIsoValida", () => {
  it("aceita datas reais e rejeita as impossíveis", () => {
    expect(dataIsoValida("2024-02-29")).toBe(true);
    expect(dataIsoValida("2023-02-29")).toBe(false);
    expect(dataIsoValida("10/05/2018")).toBe(false);
  });
});
