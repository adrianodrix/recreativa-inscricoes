import type { Alocacao, PessoaTime, VinculoResponsavel } from "./tipos";

/*
 * Quem precisa ser avisado de novo após uma edição (T17): quem mudou de time,
 * os responsáveis das crianças que mudaram e as crianças dos responsáveis que mudaram.
 */
export function calcularAfetados(anterior: Alocacao, atual: Alocacao, pessoas: PessoaTime[], vinculos: VinculoResponsavel[]): string[] {
  const ids = new Set(pessoas.map((p) => p.id));
  const movidos = new Set<string>();
  for (const id of ids) {
    if ((anterior[id] ?? null) !== (atual[id] ?? null)) movidos.add(id);
  }
  const afetados = new Set(movidos);
  for (const v of vinculos) {
    if (movidos.has(v.criancaId)) afetados.add(v.responsavelId);
    if (movidos.has(v.responsavelId)) afetados.add(v.criancaId);
  }
  return [...afetados].filter((id) => ids.has(id));
}
