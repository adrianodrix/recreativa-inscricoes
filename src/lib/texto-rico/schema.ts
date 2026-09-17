import { z } from "zod";

/*
 * Texto rico = JSON do Tiptap (ProseMirror) restrito a uma lista branca.
 * Só o que está aqui é aceito ao gravar e renderizado no público.
 */
const cor = z.string().regex(/^#[0-9a-f]{6}$/i, "Cor inválida");

const marca = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("underline") }),
  z.object({ type: z.literal("textStyle"), attrs: z.object({ color: cor.nullable().optional() }).partial() }),
]);

const texto = z.object({
  type: z.literal("text"),
  text: z.string().max(5000),
  marks: z.array(marca).max(4).optional(),
});

const quebra = z.object({ type: z.literal("hardBreak") });

const paragrafo = z.object({
  type: z.literal("paragraph"),
  content: z.array(z.union([texto, quebra])).max(500).optional(),
});

const itemLista = z.object({
  type: z.literal("listItem"),
  content: z.array(paragrafo).max(20),
});

const lista = z.object({
  type: z.enum(["bulletList", "orderedList"]),
  content: z.array(itemLista).max(100),
});

export const schemaTextoRico = z.object({
  type: z.literal("doc"),
  content: z.array(z.union([paragrafo, lista])).max(500),
});

export type TextoRico = z.infer<typeof schemaTextoRico>;
export type NoTextoRico = TextoRico["content"][number];
export type Paragrafo = z.infer<typeof paragrafo>;
export type TrechoTexto = z.infer<typeof texto>;

export const TEXTO_RICO_VAZIO: TextoRico = { type: "doc", content: [{ type: "paragraph" }] };

/* Texto sem formatação, para busca, resumo e verificação de "obrigatório". */
export function textoPlano(doc: TextoRico): string {
  return doc.content.map(noParaTexto).join("\n").trim();
}

function noParaTexto(no: NoTextoRico): string {
  if (no.type === "paragraph") return paragrafoParaTexto(no);
  return no.content.map((item) => item.content.map(paragrafoParaTexto).join("\n")).join("\n");
}

function paragrafoParaTexto(p: Paragrafo): string {
  return (p.content ?? []).map((t) => (t.type === "text" ? t.text : "\n")).join("");
}

export function textoRicoVazio(doc: TextoRico): boolean {
  return textoPlano(doc).length === 0;
}
