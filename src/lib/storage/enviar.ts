import { envPublico } from "@/lib/env-publico";
import { criarClienteNavegador } from "@/lib/supabase/client";
import type { Bucket } from "./url";

interface Envio {
  bucket: Bucket;
  caminho: string;
  arquivo: Blob;
  tipo: string;
  /* 0 a 1, conforme os bytes saem do aparelho. */
  aoProgredir?: (fracao: number) => void;
}

/*
 * Envia um arquivo do navegador direto ao Storage, com a sessão de quem está no
 * painel (as políticas do bucket só deixam o administrador enviar). Usa XHR, e
 * não o cliente do Supabase, para acompanhar o progresso: vídeo demora a subir.
 */
export async function enviarArquivo({ bucket, caminho, arquivo, tipo, aoProgredir }: Envio): Promise<void> {
  const { data } = await criarClienteNavegador().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("sua sessão expirou. Entre de novo no painel.");

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${envPublico.supabaseUrl}/storage/v1/object/${bucket}/${caminho}`);
    xhr.setRequestHeader("apikey", envPublico.supabasePublishableKey);
    xhr.setRequestHeader("authorization", `Bearer ${token}`);
    xhr.setRequestHeader("content-type", tipo);
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) aoProgredir?.(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(mensagemDoStorage(xhr.responseText, xhr.status))));
    xhr.onerror = () => reject(new Error("a conexão caiu durante o envio."));
    xhr.send(arquivo);
  });
}

function mensagemDoStorage(corpo: string, status: number): string {
  try {
    const j = JSON.parse(corpo) as { message?: string; error?: string };
    return j.message ?? j.error ?? `erro ${status}`;
  } catch {
    return `erro ${status}`;
  }
}
