"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { errosPorCampo, schemaEvento, TIPOS_COMIDA, type DadosEvento } from "@/lib/eventos/schema";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export interface EstadoFormEvento {
  erros?: Record<string, string>;
  erro?: string;
}

function linhaEvento(d: DadosEvento) {
  return {
    nome: d.nome,
    slug: d.slug,
    data_evento: d.data_evento,
    hora_inicio: d.hora_inicio,
    hora_fim: d.hora_fim,
    endereco: d.endereco,
    link_maps: d.link_maps,
    inscricoes_inicio: d.inscricoes_inicio,
    inscricoes_fim: d.inscricoes_fim,
    aberto_manual: d.aberto_manual,
    limite_inscritos: d.limite_inscritos,
    valor_inscricao: d.valor_inscricao,
    capa_path: d.capa_path,
    boas_vindas: d.boas_vindas as Json,
    agradecimento: d.agradecimento as Json,
    recomendacoes: d.recomendacoes as Json,
    edicao: d.edicao,
    subtitulo: d.subtitulo,
    descricao: d.descricao,
    link_fotos: d.link_fotos,
    regras_gerais: d.regras_gerais as Json,
  };
}

function limitesComida(eventoId: string, d: DadosEvento) {
  return TIPOS_COMIDA.map((tipo) => ({ evento_id: eventoId, tipo, limite: d[`limite_${tipo}`] }));
}

function mensagemErroBanco(mensagem: string): string {
  if (mensagem.includes("eventos_slug_key")) return "Já existe um evento com este link. Escolha outro.";
  return `Não foi possível salvar: ${mensagem}`;
}

/* Cria (id nulo) ou atualiza um evento com seus limites de comida. */
export async function salvarEvento(id: string | null, _: EstadoFormEvento, form: FormData): Promise<EstadoFormEvento> {
  await exigirPerfil("editar_evento");
  const dados = schemaEvento.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erros: errosPorCampo(dados.error), erro: "Confira os campos destacados." };

  const supabase = await criarClienteServidor();
  let eventoId = id;
  if (eventoId) {
    const { error } = await supabase.from("eventos").update(linhaEvento(dados.data)).eq("id", eventoId);
    if (error) return { erro: mensagemErroBanco(error.message) };
  } else {
    const { data, error } = await supabase.from("eventos").insert(linhaEvento(dados.data)).select("id").single();
    if (error) return { erro: mensagemErroBanco(error.message) };
    eventoId = data.id;
    // Contatos e dúvidas partem do evento anterior; o administrador ajusta depois (P11).
    await supabase.rpc("copiar_contatos_e_duvidas", { p_evento_id: eventoId });
  }

  const { error: erroLimites } = await supabase.from("limites_comida").upsert(limitesComida(eventoId, dados.data));
  if (erroLimites) return { erro: mensagemErroBanco(erroLimites.message) };

  revalidatePath("/painel/eventos");
  redirect(`/painel/eventos/${eventoId}?salvo=1`);
}

/* Chave da página inicial (P6): evento em preparação não aparece em / nem em /[slug]. */
export async function alternarPublicacao(id: string, publicado: boolean): Promise<void> {
  await exigirPerfil("editar_pagina_inicial");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("eventos").update({ publicado }).eq("id", id);
  if (error) throw new Error(mensagemErroBanco(error.message));
  revalidatePath("/", "layout");
  revalidatePath(`/painel/eventos/${id}`);
}

/* Chave manual das inscrições (V7). */
export async function alternarInscricoes(id: string, aberto: boolean): Promise<void> {
  await exigirPerfil("mudar_status");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("eventos").update({ aberto_manual: aberto }).eq("id", id);
  if (error) throw new Error(mensagemErroBanco(error.message));
  revalidatePath(`/painel/eventos/${id}`);
  revalidatePath("/painel/eventos");
}
