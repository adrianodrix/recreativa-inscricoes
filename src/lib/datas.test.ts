import { describe, expect, it } from "vitest";
import { formatarData, formatarDataHora, formatarHora, formatarValor, isoParaLocal, localParaIso } from "./datas";

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
