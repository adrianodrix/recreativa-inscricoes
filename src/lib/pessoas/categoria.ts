/*
 * Categoria de pessoa usada no painel: a mesma partição que decide as
 * brincadeiras (B5). Cada inscrito cai em exatamente uma.
 */
export type CategoriaPessoa = "crianca" | "jovem" | "casado" | "adulto";

export const CATEGORIAS_PESSOA: readonly CategoriaPessoa[] = ["crianca", "jovem", "casado", "adulto"];

export const ROTULO_CATEGORIA_PESSOA: Record<CategoriaPessoa, { nome: string; regra: string }> = {
  crianca: { nome: "Crianças", regra: "até 8 anos" },
  jovem: { nome: "Jovens", regra: "solteiros de 9 a 30 anos" },
  casado: { nome: "Casados", regra: "brincadeiras de casais" },
  adulto: { nome: "Adultos solteiros", regra: "acima de 30, sem brincadeiras" },
};

export function categoriaDaPessoa(idade: number, casado: boolean): CategoriaPessoa {
  if (idade <= 8) return "crianca";
  if (casado) return "casado";
  if (idade <= 30) return "jovem";
  return "adulto";
}
