/*
 * Dados estruturados no HTML. O conteúdo é montado por nós (nunca vem do
 * visitante); ainda assim escapa `<` para não fechar o script por acidente.
 */
export function JsonLd({ dados }: { dados: Record<string, unknown> }) {
  const json = JSON.stringify(dados).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
