/* Só aceita caminhos internos do painel como destino de redirecionamento. */
export function destinoSeguro(valor: string | null | undefined, padrao = "/painel/eventos"): string {
  if (!valor) return padrao;
  if (!valor.startsWith("/painel")) return padrao;
  if (valor.startsWith("//") || valor.includes("://")) return padrao;
  return valor;
}
