import { describe, expect, it } from "vitest";
import { servicoIndisponivel } from "./indisponivel";

describe("servicoIndisponivel", () => {
  it("reconhece falhas de rede e do servidor", () => {
    expect(servicoIndisponivel({ name: "AuthRetryableFetchError", status: 0 })).toBe(true);
    expect(servicoIndisponivel({ name: "AuthApiError", status: 503 })).toBe(true);
    expect(servicoIndisponivel(new TypeError("fetch failed"))).toBe(true);
    expect(servicoIndisponivel({ message: "connect ECONNREFUSED 127.0.0.1:54321" })).toBe(true);
  });

  it("não confunde com sessão ausente ou inválida", () => {
    expect(servicoIndisponivel({ name: "AuthSessionMissingError", status: 400 })).toBe(false);
    expect(servicoIndisponivel({ name: "AuthApiError", status: 401 })).toBe(false);
    expect(servicoIndisponivel(null)).toBe(false);
    expect(servicoIndisponivel({ message: "Invalid login credentials" })).toBe(false);
  });
});
