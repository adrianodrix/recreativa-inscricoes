"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { errosPorCampo } from "@/lib/eventos/schema";
import { schemaItemProgramacao } from "@/lib/pagina-inicial/schema";
import { criarClienteServidor } from "@/lib/supabase/server";

export interface EstadoFormItem {
  erros?: Record<string, string>;
  erro?: string;
}

const rota = (eventoId: string) => `/painel/eventos/${eventoId}/programacao`;

export async function salvarItemProgramacao(
  eventoId: string,
  id: string | null,
  _: EstadoFormItem,
  form: FormData,
): Promise<EstadoFormItem> {
  await exigirPerfil("editar_pagina_inicial");
  const dados = schemaItemProgramacao.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erros: errosPorCampo(dados.error), erro: "Confira os campos destacados." };

  const supabase = await criarClienteServidor();
  const linha = { ...dados.data, evento_id: eventoId };
  const { error } = id
    ? await supabase.from("programacao").update(linha).eq("id", id).eq("evento_id", eventoId)
    : await supabase.from("programacao").insert(linha);
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath(rota(eventoId));
  redirect(`${rota(eventoId)}?salvo=1`);
}

export async function excluirItemProgramacao(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("editar_pagina_inicial");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("programacao").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
  revalidatePath(rota(eventoId));
  redirect(rota(eventoId));
}
