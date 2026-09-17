"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { errosPorCampo } from "@/lib/eventos/schema";
import { schemaContato } from "@/lib/pagina-inicial/schema";
import { gravarOrdem, proximaOrdem } from "@/lib/supabase/ordem";
import { criarClienteServidor } from "@/lib/supabase/server";

export interface EstadoFormContato {
  erros?: Record<string, string>;
  erro?: string;
}

const rota = (eventoId: string) => `/painel/eventos/${eventoId}/contatos`;

export async function salvarContato(
  eventoId: string,
  id: string | null,
  _: EstadoFormContato,
  form: FormData,
): Promise<EstadoFormContato> {
  await exigirPerfil("editar_pagina_inicial");
  const dados = schemaContato.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erros: errosPorCampo(dados.error), erro: "Confira os campos destacados." };

  const supabase = await criarClienteServidor();
  const linha = { ...dados.data, evento_id: eventoId };
  const { error } = id
    ? await supabase.from("contatos").update(linha).eq("id", id).eq("evento_id", eventoId)
    : await supabase.from("contatos").insert({ ...linha, ordem: await proximaOrdem(supabase, "contatos", eventoId) });
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath(rota(eventoId));
  redirect(`${rota(eventoId)}?salvo=1`);
}

export async function reordenarContatos(eventoId: string, ids: string[]): Promise<void> {
  await exigirPerfil("editar_pagina_inicial");
  const supabase = await criarClienteServidor();
  await gravarOrdem(supabase, "contatos", eventoId, ids);
  revalidatePath(rota(eventoId));
}

export async function excluirContato(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("editar_pagina_inicial");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("contatos").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
  revalidatePath(rota(eventoId));
  redirect(rota(eventoId));
}
