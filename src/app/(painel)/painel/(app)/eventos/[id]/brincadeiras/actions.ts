"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { schemaBrincadeira } from "@/lib/brincadeiras/schema";
import { errosPorCampo } from "@/lib/eventos/schema";
import { arquivosSubstituidos } from "@/lib/storage/arquivos";
import { removerArquivos } from "@/lib/storage/remover";
import { BUCKET_IMAGENS, BUCKET_VIDEOS } from "@/lib/storage/url";
import { gravarOrdem, proximaOrdem } from "@/lib/supabase/ordem";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export interface EstadoFormBrincadeira {
  erros?: Record<string, string>;
  erro?: string;
}

export async function salvarBrincadeira(eventoId: string, id: string | null, _: EstadoFormBrincadeira, form: FormData): Promise<EstadoFormBrincadeira> {
  await exigirPerfil("editar_brincadeira");
  const dados = schemaBrincadeira.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erros: errosPorCampo(dados.error), erro: "Confira os campos destacados." };

  const linha = { ...dados.data, evento_id: eventoId, regras: dados.data.regras as Json };
  const supabase = await criarClienteServidor();
  let brincadeiraId = id;
  if (id) {
    const antes = await midiaDe(supabase, eventoId, id);
    const { error } = await supabase.from("brincadeiras").update(linha).eq("id", id).eq("evento_id", eventoId);
    if (error) return { erro: traduzir(error.message) };
    await removerMidia(supabase, antes, linha);
  } else {
    const ordem = await proximaOrdem(supabase, "brincadeiras", eventoId); // entra no fim da lista
    const { data, error } = await supabase.from("brincadeiras").insert({ ...linha, ordem }).select("id").single();
    if (error) return { erro: traduzir(error.message) };
    brincadeiraId = data.id;
  }
  revalidatePath(`/painel/eventos/${eventoId}/brincadeiras`);
  redirect(`/painel/eventos/${eventoId}/brincadeiras/${brincadeiraId}?salvo=1`);
}

/* Grava a ordem de exibição (a mesma do formulário público) na sequência em que os ids chegam. */
export async function reordenarBrincadeiras(eventoId: string, ids: string[]): Promise<void> {
  await exigirPerfil("editar_brincadeira");
  const supabase = await criarClienteServidor();
  await gravarOrdem(supabase, "brincadeiras", eventoId, ids);
  revalidatePath(`/painel/eventos/${eventoId}/brincadeiras`);
}

export async function excluirBrincadeira(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("editar_brincadeira");
  const supabase = await criarClienteServidor();
  const { count } = await supabase.from("participacoes").select("id", { count: "exact", head: true }).eq("brincadeira_id", id);
  if ((count ?? 0) > 0) throw new Error("Esta brincadeira já tem participantes. Desative em vez de excluir.");
  const antes = await midiaDe(supabase, eventoId, id);
  const { error } = await supabase.from("brincadeiras").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(traduzir(error.message));
  await removerMidia(supabase, antes, { foto_path: null, video_path: null });
  revalidatePath(`/painel/eventos/${eventoId}/brincadeiras`);
  redirect(`/painel/eventos/${eventoId}/brincadeiras`);
}

type Cliente = Awaited<ReturnType<typeof criarClienteServidor>>;
interface Midia {
  foto_path: string | null;
  video_path: string | null;
}

async function midiaDe(supabase: Cliente, eventoId: string, id: string): Promise<Midia> {
  const { data } = await supabase.from("brincadeiras").select("foto_path, video_path").eq("id", id).eq("evento_id", eventoId).maybeSingle();
  return data ?? { foto_path: null, video_path: null };
}

/* Depois de salvar ou excluir: apaga do Storage a foto e o vídeo que deixaram de ser usados. */
async function removerMidia(supabase: Cliente, antes: Midia, depois: Midia): Promise<void> {
  await removerArquivos(supabase, BUCKET_IMAGENS, arquivosSubstituidos([antes.foto_path], [depois.foto_path]));
  await removerArquivos(supabase, BUCKET_VIDEOS, arquivosSubstituidos([antes.video_path], [depois.video_path]));
}

function traduzir(mensagem: string): string {
  if (mensagem.includes("participacoes_brincadeira_id_categoria_fkey")) {
    return "Não é possível mudar a categoria de uma brincadeira que já tem participantes.";
  }
  return `Não foi possível salvar: ${mensagem}`;
}
