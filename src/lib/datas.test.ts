import { describe, expect, it } from "vitest";
import { diasAte, emDias, formatarData, formatarDataHora, formatarHora, formatarValor, isoParaLocal, localParaIso } from "./datas";

describe("conversão datetime-local <-> ISO", () => {
  it("interpreta o input como hora de Brasília", () => {
    expect(localParaIso("2026-09-01T08:00")).toBe("2026-09-01T08:00:00-03:00");
  });

  it("volta ao formato do input a partir de qualquer fuso", () => {
    expect(isoParaLocal("2026-09-01T11:00:00Z")).toBe("2026-09-01T08:00");
    expect(isoParaLocal("2026-09-01T08:00:00-03:00")).toBe("2026-09-01T08:00");
    expect(isoParaLocal("2026-09-02T02:30:00Z")).toBe("2026-09-01T23:30");
  });
});

describe("formatação", () => {
  it("formata data, hora, data-hora e valor em pt-BR", () => {
    expect(formatarData("2026-09-01")).toBe("01/09/2026");
    expect(formatarHora("08:30:00")).toBe("08:30");
    expect(formatarDataHora("2026-09-01T11:05:00Z")).toBe("01/09/2026, 08:05");
    expect(formatarValor(0)).toBe("Gratuito");
    expect(formatarValor(25.5)).toBe("R$ 25,50");
  });
});

describe("dias até uma data", () => {
  it("conta a partir do dia de hoje em Brasília", () => {
    const agora = new Date("2026-09-17T12:00:00-03:00");
    expect(diasAte("2026-11-21", agora)).toBe(65);
    expect(diasAte("2026-09-17", agora)).toBe(0);
    expect(diasAte("2026-11-15T23:59:00-03:00", agora)).toBe(59);
    // 01:00 UTC ainda é dia 17 em Brasília
    expect(diasAte("2026-09-18", new Date("2026-09-18T01:00:00Z"))).toBe(1);
  });

  it("escreve a distância em dias", () => {
    expect(emDias(0)).toBe("hoje");
    expect(emDias(1)).toBe("amanhã");
    expect(emDias(-1)).toBe("ontem");
    expect(emDias(65)).toBe("em 65 dias");
    expect(emDias(-3)).toBe("há 3 dias");
  });
});
