import { describe, expect, it } from "vitest";
import { statusInscricoes } from "./status";

const evento = {
  aberto_manual: true,
  inscricoes_inicio: "2026-09-01T00:00:00-03:00",
  inscricoes_fim: "2026-10-01T00:00:00-03:00",
  limite_inscritos: 100,
};
const dentro = new Date("2026-09-15T12:00:00-03:00");

describe("statusInscricoes", () => {
  it("abre dentro do período com vagas e chave ligada", () => {
    expect(statusInscricoes(evento, 10, dentro)).toEqual({ aberto: true, motivo: null });
  });

  it("fecha por chave manual, mesmo dentro do período", () => {
    expect(statusInscricoes({ ...evento, aberto_manual: false }, 10, dentro).motivo).toBe("manual");
  });

  it("fecha antes e depois do período", () => {
    expect(statusInscricoes(evento, 0, new Date("2026-08-31T23:59:00-03:00")).motivo).toBe("antes_do_periodo");
    expect(statusInscricoes(evento, 0, new Date("2026-10-01T00:00:00-03:00")).motivo).toBe("periodo_encerrado");
  });

  it("fecha ao atingir o limite de inscritos", () => {
    expect(statusInscricoes(evento, 100, dentro).motivo).toBe("limite");
  });
});
