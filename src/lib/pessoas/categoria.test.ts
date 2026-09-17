import { describe, expect, it } from "vitest";
import { categoriaDaPessoa } from "./categoria";

describe("categoriaDaPessoa", () => {
  it("segue a mesma partição das brincadeiras", () => {
    expect(categoriaDaPessoa(8, false)).toBe("crianca");
    expect(categoriaDaPessoa(9, false)).toBe("jovem");
    expect(categoriaDaPessoa(30, false)).toBe("jovem");
    expect(categoriaDaPessoa(31, false)).toBe("adulto");
    expect(categoriaDaPessoa(25, true)).toBe("casado");
  });
});
