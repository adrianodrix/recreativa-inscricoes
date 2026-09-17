/*
 * Distingue falha de infraestrutura (rede, tempo esgotado, 5xx) de sessão
 * ausente ou inválida. Puro: usado no proxy e no servidor.
 */
export const DIGEST_INDISPONIVEL = "SERVICO_INDISPONIVEL";

export function servicoIndisponivel(erro: unknown): boolean {
  if (!erro || typeof erro !== "object") return false;
  const e = erro as { name?: string; status?: number | null; message?: string };
  if (e.name === "AuthRetryableFetchError" || e.name === "AuthUnknownError") return true;
  if (typeof e.status === "number") return e.status === 0 || e.status === 408 || e.status === 429 || e.status >= 500;
  return /fetch failed|ECONNREFUSED|ECONNRESET|ETIMEDOUT|timeout|network/i.test(e.message ?? "");
}
