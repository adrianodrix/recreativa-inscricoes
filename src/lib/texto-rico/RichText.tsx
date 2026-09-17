import type { CSSProperties, ReactNode } from "react";
import type { NoTextoRico, Paragrafo, TextoRico, TrechoTexto } from "./schema";

/*
 * Renderiza o texto rico validado como elementos React. Sem HTML bruto:
 * XSS é impossível por construção. Estilos vêm da classe rc-prose (kit).
 */
export function RichText({ doc, className }: { doc: TextoRico; className?: string }) {
  return <div className={`rc-prose ${className ?? ""}`}>{doc.content.map(renderNo)}</div>;
}

function renderNo(no: NoTextoRico, i: number): ReactNode {
  if (no.type === "paragraph") return renderParagrafo(no, i);
  const Lista = no.type === "orderedList" ? "ol" : "ul";
  return (
    <Lista key={i}>
      {no.content.map((item, j) => (
        <li key={j}>{item.content.map(renderParagrafo)}</li>
      ))}
    </Lista>
  );
}

function renderParagrafo(p: Paragrafo, i: number): ReactNode {
  const conteudo = p.content ?? [];
  if (conteudo.length === 0) return <p key={i}>&nbsp;</p>;
  return <p key={i}>{conteudo.map((t, j) => (t.type === "text" ? renderTrecho(t, j) : <br key={j} />))}</p>;
}

function renderTrecho(t: TrechoTexto, chave: number): ReactNode {
  let no: ReactNode = t.text;
  const estilo: CSSProperties = {};
  for (const marca of t.marks ?? []) {
    if (marca.type === "bold") no = <strong>{no}</strong>;
    else if (marca.type === "italic") no = <em>{no}</em>;
    else if (marca.type === "underline") no = <u>{no}</u>;
    else if (marca.type === "textStyle" && marca.attrs?.color) estilo.color = marca.attrs.color;
  }
  return estilo.color ? (
    <span key={chave} style={estilo}>
      {no}
    </span>
  ) : (
    <span key={chave}>{no}</span>
  );
}
