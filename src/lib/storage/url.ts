import { envPublico } from "@/lib/env-publico";

export const BUCKET_IMAGENS = "imagens";

/* URL pública de um arquivo do bucket de imagens (capas, brincadeiras, times). */
export function urlImagem(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${envPublico.supabaseUrl}/storage/v1/object/public/${BUCKET_IMAGENS}/${path}`;
}
