"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { schemaBrincadeira } from "@/lib/brincadeiras/schema";
import { errosPorCampo } from "@/lib/eventos/schema";
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
  if (id) {
    const { error } = await supabase.from("brincadeiras").update(linha).eq("id", id).eq("evento_id", eventoId);
    if (error) return { erro: traduzir(error.message) };
  } else {
    const { error } = await supabase.from("brincadeiras").insert(linha);
    if (error) return { erro: traduzir(error.message) };
  }
  revalidatePath(`/painel/eventos/${eventoId}/brincadeiras`);
  redirect(`/painel/eventos/${eventoId}/brincadeiras?salvo=1`);
}

export async function excluirBrincadeira(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("editar_brincadeira");
  const supabase = await criarClienteServidor();
  const { count } = await supabase.from("participacoes").select("id", { count: "exact", head: true }).eq("brincadeira_id", id);
  if ((count ?? 0) > 0) throw new Error("Esta brincadeira já tem participantes. Desative em vez de excluir.");
  const { error } = await supabase.from("brincadeiras").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(traduzir(error.message));
  revalidatePath(`/painel/eventos/${eventoId}/brincadeiras`);
  redirect(`/painel/eventos/${eventoId}/brincadeiras`);
}

function traduzir(mensagem: string): string {
  if (mensagem.includes("participacoes_brincadeira_id_categoria_fkey")) {
    return "Não é possível mudar a categoria de uma brincadeira que já tem participantes.";
  }
  return `Não foi possível salvar: ${mensagem}`;
}
