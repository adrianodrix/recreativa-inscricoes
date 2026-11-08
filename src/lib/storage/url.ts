import { envPublico } from "@/lib/env-publico";

export const BUCKET_IMAGENS = "imagens";
export const BUCKET_VIDEOS = "videos";
export type Bucket = typeof BUCKET_IMAGENS | typeof BUCKET_VIDEOS;

function urlPublica(bucket: Bucket, path: string | null | undefined): string | null {
  if (!path) return null;
  return `${envPublico.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/* URL pública de um arquivo do bucket de imagens (capas, brincadeiras, times). */
export function urlImagem(path: string | null | undefined): string | null {
  return urlPublica(BUCKET_IMAGENS, path);
}

/* URL pública de um vídeo enviado (brincadeiras). */
export function urlVideo(path: string | null | undefined): string | null {
  return urlPublica(BUCKET_VIDEOS, path);
}
