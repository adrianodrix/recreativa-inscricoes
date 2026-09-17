import { describe, expect, it } from "vitest";
import { pode } from "./permissoes";

describe("pode", () => {
  it("analítico só vê", () => {
    expect(pode("analitico", "ver")).toBe(true);
    expect(pode("analitico", "editar_inscrito")).toBe(false);
    expect(pode("analitico", "editar_evento")).toBe(false);
  });

  it("operador edita inscritos e reenvia WhatsApp, mas não mexe em eventos", () => {
    expect(pode("operador", "editar_inscrito")).toBe(true);
    expect(pode("operador", "reenviar_whatsapp")).toBe(true);
    expect(pode("operador", "editar_evento")).toBe(false);
    expect(pode("operador", "mudar_status")).toBe(false);
    expect(pode("operador", "gerir_usuarios")).toBe(false);
  });

  it("administrador faz tudo e sem perfil não faz nada", () => {
    expect(pode("administrador", "gerir_usuarios")).toBe(true);
    expect(pode(null, "ver")).toBe(false);
  });
});
