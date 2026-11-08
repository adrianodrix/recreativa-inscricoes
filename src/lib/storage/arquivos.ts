/* Regras de arquivos enviados ao Storage. Puro. */

/* Espelho do bucket "videos" (migration 0018). */
export const VIDEO_TAMANHO_MAXIMO = 50 * 1024 * 1024;
export const VIDEO_TIPOS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
};

export type ValidacaoVideo = { ok: true; extensao: string } | { ok: false; erro: string };

/* Confere tipo e tamanho antes de enviar, para não gastar o upload à toa. */
export function validarVideo(arquivo: { type: string; size: number }): ValidacaoVideo {
  const extensao = VIDEO_TIPOS[arquivo.type];
  if (!extensao) return { ok: false, erro: "Envie um vídeo MP4, MOV ou WebM." };
  if (arquivo.size > VIDEO_TAMANHO_MAXIMO) {
    return { ok: false, erro: `O vídeo tem ${megas(arquivo.size)}; o limite é ${megas(VIDEO_TAMANHO_MAXIMO)}. Envie um trecho mais curto ou use o link do YouTube.` };
  }
  return { ok: true, extensao };
}

/* 52428800 → "50 MB"; 1572864 → "1,5 MB" */
export function megas(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toLocaleString("pt-BR", { maximumFractionDigits: mb < 10 ? 1 : 0 })} MB`;
}

/* Caminhos que saíram do registro ao salvar (trocados ou removidos): podem ser apagados do Storage. */
export function arquivosSubstituidos(antes: readonly (string | null | undefined)[], depois: readonly (string | null | undefined)[]): string[] {
  const mantidos = new Set(depois.filter(Boolean));
  return [...new Set(antes.filter((p): p is string => Boolean(p) && !mantidos.has(p)))];
}
