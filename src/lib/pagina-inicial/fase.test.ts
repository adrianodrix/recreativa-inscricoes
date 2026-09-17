import { describe, expect, it } from "vitest";
import { faseDaPagina } from "./fase";

const evento = {
  publicado: true,
  aberto_manual: true,
  inscricoes_inicio: "2026-09-01T00:00:00-03:00",
  inscricoes_fim: "2026-10-01T00:00:00-03:00",
  limite_inscritos: 100,
  data_evento: "2026-10-10",
  hora_fim: "18:30:00",
};

describe("faseDaPagina", () => {
  it("mostra as inscrições abertas dentro do período", () => {
    expect(faseDaPagina(evento, 10, new Date("2026-09-15T12:00:00-03:00"))).toEqual({ fase: "abertas" });
  });

  it("avisa que ainda vão abrir antes do período", () => {
    expect(faseDaPagina(evento, 0, new Date("2026-08-20T12:00:00-03:00"))).toEqual({ fase: "em_breve" });
  });

  it("mostra encerradas com o motivo", () => {
    expect(faseDaPagina(evento, 100, new Date("2026-09-15T12:00:00-03:00"))).toEqual({
      fase: "encerradas",
      motivo: "limite",
    });
    expect(faseDaPagina(evento, 0, new Date("2026-10-05T12:00:00-03:00"))).toEqual({
      fase: "encerradas",
      motivo: "periodo_encerrado",
    });
  });

  it("vira realizado a partir do horário de término, no fuso de Brasília", () => {
    expect(faseDaPagina(evento, 0, new Date("2026-10-10T18:29:00-03:00")).fase).toBe("encerradas");
    expect(faseDaPagina(evento, 0, new Date("2026-10-10T18:30:00-03:00")).fase).toBe("realizado");
    expect(faseDaPagina(evento, 0, new Date("2027-01-01T12:00:00-03:00")).fase).toBe("realizado");
  });

  it("trata o evento em preparação como encerrado (prévia do painel)", () => {
    expect(faseDaPagina({ ...evento, publicado: false }, 0, new Date("2026-09-15T12:00:00-03:00"))).toEqual({
      fase: "encerradas",
      motivo: "nao_publicado",
    });
  });
});
