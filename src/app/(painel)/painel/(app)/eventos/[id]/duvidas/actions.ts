"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { errosPorCampo } from "@/lib/eventos/schema";
import { schemaPergunta } from "@/lib/pagina-inicial/schema";
import { gravarOrdem, proximaOrdem } from "@/lib/supabase/ordem";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export interface EstadoFormPergunta {
  erros?: Record<string, string>;
  erro?: string;
}

const rota = (eventoId: string) => `/painel/eventos/${eventoId}/duvidas`;

export async function salvarPergunta(
  eventoId: string,
  id: string | null,
  _: EstadoFormPergunta,
  form: FormData,
): Promise<EstadoFormPergunta> {
  await exigirPerfil("editar_pagina_inicial");
  const dados = schemaPergunta.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erros: errosPorCampo(dados.error), erro: "Confira os campos destacados." };

  const supabase = await criarClienteServidor();
  const linha = { evento_id: eventoId, pergunta: dados.data.pergunta, resposta: dados.data.resposta as Json };
  const { error } = id
    ? await supabase.from("perguntas_frequentes").update(linha).eq("id", id).eq("evento_id", eventoId)
    : await supabase
        .from("perguntas_frequentes")
        .insert({ ...linha, ordem: await proximaOrdem(supabase, "perguntas_frequentes", eventoId) });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath(rota(eventoId));
  redirect(`${rota(eventoId)}?salvo=1`);
}

export async function reordenarPerguntas(eventoId: string, ids: string[]): Promise<void> {
  await exigirPerfil("editar_pagina_inicial");
  const supabase = await criarClienteServidor();
  await gravarOrdem(supabase, "perguntas_frequentes", eventoId, ids);
  revalidatePath(rota(eventoId));
}

export async function excluirPergunta(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("editar_pagina_inicial");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("perguntas_frequentes").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
  revalidatePath(rota(eventoId));
  redirect(rota(eventoId));
}
