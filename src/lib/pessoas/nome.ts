/* Espelho TypeScript de public.normalizar_nome e da validação de nome completo (E1). */
export function normalizarNome(nome: string): string {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export const NOME_MINIMO_CARACTERES = 10;

export type ProblemaNome = "curto" | "numeros" | "incompleto";

/* Retorna o problema encontrado ou null se o nome completo é aceitável. */
export function validarNomeCompleto(nome: string): ProblemaNome | null {
  const limpo = nome.trim().replace(/\s+/g, " ");
  if (/\d/.test(limpo)) return "numeros";
  if (limpo.length < NOME_MINIMO_CARACTERES) return "curto";
  const partes = limpo.split(" ").filter((p) => p.length > 1);
  if (partes.length < 2) return "incompleto";
  return null;
}

/* Primeiro nome do nome completo, sugerido como apelido (E2). */
export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}
