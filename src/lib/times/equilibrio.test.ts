import { describe, expect, it } from "vitest";
import { equilibrioDoTime } from "./equilibrio";

describe("equilibrioDoTime", () => {
  it("divide os elegíveis igualmente para a cota", () => {
    expect(equilibrioDoTime(0, [0, 0, 0], 10)).toMatchObject({ cota: 4, nivel: "normal", legenda: "Sem membros ainda" });
  });

  it("tolera diferença de 1 entre times", () => {
    expect(equilibrioDoTime(3, [3, 2], 5)).toMatchObject({ cota: 3, nivel: "ok", legenda: "Equilibrado" });
    expect(equilibrioDoTime(2, [3, 2], 5)).toMatchObject({ nivel: "ok" });
  });

  it("aponta o maior e o menor time quando a diferença passa de 1", () => {
    expect(equilibrioDoTime(5, [5, 3, 2], 10)).toMatchObject({ nivel: "critico", legenda: "3 a mais que o menor time" });
    expect(equilibrioDoTime(2, [5, 3, 2], 10)).toMatchObject({ nivel: "atencao", legenda: "3 a menos que o maior time" });
    expect(equilibrioDoTime(3, [5, 3, 2], 10)).toMatchObject({ nivel: "ok" });
  });
});
