import { describe, expect, it } from "vitest";
import { gerarCsv } from "./csv";

describe("gerarCsv", () => {
  it("usa ponto-e-vírgula, BOM e escapa aspas e separadores", () => {
    const csv = gerarCsv(["Nome", "Obs"], [["Ana; Souza", 'Disse "oi"']]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"Ana; Souza";"Disse ""oi"""');
    expect(csv.split("\r\n")[0]).toBe("﻿Nome;Obs");
  });
});
