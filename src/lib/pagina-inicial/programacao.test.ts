import { describe, expect, it } from "vitest";
import { faixaHorario, resumoDoDia, type ItemProgramacao } from "./programacao";

const item = (id: string, destaque = false): ItemProgramacao => ({
  id,
  hora_inicio: "13:00:00",
  hora_fim: null,
  titulo: id,
  detalhe: null,
  destaque,
  brincadeira: null,
});

describe("faixaHorario", () => {
  it("escreve a hora cheia sem minutos e mantém os quebrados", () => {
    expect(faixaHorario("13:00:00", null)).toBe("13h");
    expect(faixaHorario("14:30", null)).toBe("14h30");
  });

  it("junta início e fim quando há os dois", () => {
    expect(faixaHorario("14:30", "15:15")).toBe("14h30 – 15h15");
    expect(faixaHorario("13:00", "14:00")).toBe("13h – 14h");
  });
});

describe("resumoDoDia", () => {
  it("usa os itens marcados como destaque", () => {
    const itens = [item("a"), item("b", true), item("c"), item("d", true)];
    expect(resumoDoDia(itens).map((i) => i.id)).toEqual(["b", "d"]);
  });

  it("sem destaque marcado, mostra os primeiros da lista", () => {
    const itens = [item("a"), item("b"), item("c"), item("d"), item("e")];
    expect(resumoDoDia(itens).map((i) => i.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("respeita o máximo também nos destaques", () => {
    const itens = [item("a", true), item("b", true), item("c", true)];
    expect(resumoDoDia(itens, 2).map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("aceita lista vazia", () => {
    expect(resumoDoDia([])).toEqual([]);
  });
});
