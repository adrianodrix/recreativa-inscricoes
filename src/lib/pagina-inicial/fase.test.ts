import { describe, expect, it } from "vitest";
import { faseDaPagina } from "./fase";

const evento = { data_evento: "2026-10-10", hora_fim: "18:30:00", motivo_fechado: null };

describe("faseDaPagina", () => {
  it("mostra as inscrições abertas quando não há motivo de fechamento", () => {
    expect(faseDaPagina(evento, new Date("2026-09-15T12:00:00-03:00"))).toEqual({ fase: "abertas" });
  });

  it("avisa que ainda vão abrir antes do período", () => {
    expect(faseDaPagina({ ...evento, motivo_fechado: "antes_do_periodo" }, new Date("2026-08-20T12:00:00-03:00"))).toEqual({
      fase: "em_breve",
    });
  });

  it("mostra encerradas com o motivo", () => {
    const agora = new Date("2026-09-15T12:00:00-03:00");
    expect(faseDaPagina({ ...evento, motivo_fechado: "limite" }, agora)).toEqual({ fase: "encerradas", motivo: "limite" });
    expect(faseDaPagina({ ...evento, motivo_fechado: "manual" }, agora)).toEqual({ fase: "encerradas", motivo: "manual" });
  });

  it("vira realizado a partir do horário de término, no fuso de Brasília", () => {
    expect(faseDaPagina({ ...evento, motivo_fechado: "periodo_encerrado" }, new Date("2026-10-10T18:29:00-03:00")).fase).toBe("encerradas");
    expect(faseDaPagina({ ...evento, motivo_fechado: "periodo_encerrado" }, new Date("2026-10-10T18:30:00-03:00")).fase).toBe("realizado");
    expect(faseDaPagina(evento, new Date("2027-01-01T12:00:00-03:00")).fase).toBe("realizado");
  });

  it("trata o evento em preparação como encerrado (prévia do painel)", () => {
    expect(faseDaPagina({ ...evento, motivo_fechado: "nao_publicado" }, new Date("2026-09-15T12:00:00-03:00"))).toEqual({
      fase: "encerradas",
      motivo: "nao_publicado",
    });
  });
});
