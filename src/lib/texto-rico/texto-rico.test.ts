import { describe, expect, it } from "vitest";
import { schemaTextoRico, textoPlano, textoRicoVazio } from "./schema";
import { paraWhatsapp } from "./whatsapp";

const doc = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Traga " },
        { type: "text", text: "água", marks: [{ type: "bold" }] },
        { type: "text", text: " e ", marks: [] },
        { type: "text", text: "boné 🧢", marks: [{ type: "italic" }, { type: "textStyle", attrs: { color: "#a14e1d" } }] },
      ],
    },
    {
      type: "bulletList",
      content: [
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item um" }] }] },
        { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item dois" }] }] },
      ],
    },
  ],
};

describe("schemaTextoRico", () => {
  it("aceita o documento com marcas permitidas e emojis", () => {
    expect(schemaTextoRico.safeParse(doc).success).toBe(true);
  });

  it("rejeita nós e marcas fora da lista branca", () => {
    const comImagem = { type: "doc", content: [{ type: "image", attrs: { src: "x" } }] };
    expect(schemaTextoRico.safeParse(comImagem).success).toBe(false);
    const comLink = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }] };
    expect(schemaTextoRico.safeParse(comLink).success).toBe(false);
    const corInvalida = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "textStyle", attrs: { color: "url(x)" } }] }] }] };
    expect(schemaTextoRico.safeParse(corInvalida).success).toBe(false);
  });
});

describe("textoPlano e vazio", () => {
  it("extrai o texto e detecta documento vazio", () => {
    const parsed = schemaTextoRico.parse(doc);
    expect(textoPlano(parsed)).toBe("Traga água e boné 🧢\nItem um\nItem dois");
    expect(textoRicoVazio({ type: "doc", content: [{ type: "paragraph" }] })).toBe(true);
  });
});

describe("paraWhatsapp", () => {
  it("usa a formatação do WhatsApp e marcadores de lista", () => {
    expect(paraWhatsapp(schemaTextoRico.parse(doc))).toBe("Traga *água* e _boné 🧢_\n• Item um\n• Item dois");
  });
});
