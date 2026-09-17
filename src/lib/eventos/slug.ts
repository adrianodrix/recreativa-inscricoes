export const SLUGS_RESERVADOS = new Set(["painel", "api", "obrigado"]);

/* Gera o slug público a partir do nome: minúsculas, sem acentos, hífens. */
export function gerarSlug(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugValido(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !SLUGS_RESERVADOS.has(slug);
}
