import type { NoTextoRico, Paragrafo, TextoRico, TrechoTexto } from "./schema";

/* Converte o texto rico para a formatação do WhatsApp (*negrito*, _itálico_). */
export function paraWhatsapp(doc: TextoRico): string {
  return doc.content.map(noParaWhatsapp).join("\n").trim();
}

function noParaWhatsapp(no: NoTextoRico): string {
  if (no.type === "paragraph") return paragrafoParaWhatsapp(no);
  const marcador = (i: number) => (no.type === "orderedList" ? `${i + 1}.` : "•");
  return no.content
    .map((item, i) => `${marcador(i)} ${item.content.map(paragrafoParaWhatsapp).join("\n")}`)
    .join("\n");
}

function paragrafoParaWhatsapp(p: Paragrafo): string {
  return (p.content ?? []).map((t) => (t.type === "text" ? trechoParaWhatsapp(t) : "\n")).join("");
}

function trechoParaWhatsapp(t: TrechoTexto): string {
  const tipos = new Set((t.marks ?? []).map((m) => m.type));
  const texto = t.text.trim();
  if (!texto) return t.text;
  let saida = texto;
  if (tipos.has("bold")) saida = `*${saida}*`;
  if (tipos.has("italic")) saida = `_${saida}_`;
  // Preserva espaços externos fora da formatação, senão o WhatsApp não aplica.
  const antes = t.text.match(/^\s*/)?.[0] ?? "";
  const depois = t.text.match(/\s*$/)?.[0] ?? "";
  return `${antes}${saida}${depois}`;
}
