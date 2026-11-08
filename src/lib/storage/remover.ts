import "server-only";
import type { criarClienteServidor } from "@/lib/supabase/server";
import type { Bucket } from "./url";

type Cliente = Awaited<ReturnType<typeof criarClienteServidor>>;

/*
 * Apaga do Storage arquivos que o registro deixou de usar (trocados, removidos
 * ou de um registro excluído). Melhor esforço: o registro já foi salvo, então uma
 * falha aqui só deixa o arquivo sobrando e fica registrada no log.
 */
export async function removerArquivos(supabase: Cliente, bucket: Bucket, caminhos: string[]): Promise<void> {
  if (caminhos.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(caminhos);
  if (error) console.error(`[storage] não foi possível apagar de ${bucket}:`, caminhos, error.message);
}
