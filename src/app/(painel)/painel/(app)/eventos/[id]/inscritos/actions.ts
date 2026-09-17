"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { processarPendentes } from "@/lib/whatsapp/outbox";
import { detalheDe } from "@/app/(publico)/[slug]/actions";
import type { ResultadoEnvio } from "@/features/inscricao/modelo/erros";
import { schemaPayload, type PayloadInscricao } from "@/features/inscricao/modelo/payload";
import { primeiraMensagem, schemaApelido, schemaNascimento, schemaNome, schemaWhatsapp } from "@/features/inscricao/modelo/schemas";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { calcularIdade } from "@/lib/pessoas/idade";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export interface EstadoInscrito {
  erros?: Record<string, string>;
  erro?: string;
  ok?: string;
}

/* Inclusão pelo painel: mesma RPC de validação, sem a trava de período/chave. */
export async function enviarInscricaoPainel(payload: PayloadInscricao): Promise<ResultadoEnvio> {
  await exigirPerfil("editar_inscrito");
  const dados = schemaPayload.safeParse(payload);
  if (!dados.success) return { ok: false, erro: { codigo: "payload_invalido", detalhe: {} } };
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("criar_inscricao_painel", { p: dados.data as unknown as Json });
  if (error) return { ok: false, erro: { codigo: error.message, detalhe: await detalheDe(error.details) } };
  revalidatePath(`/painel/eventos/${payload.evento_id}/inscritos`);
  after(() => processarPendentes(5).catch((e) => console.error("[whatsapp] confirmação", e)));
  return { ok: true };
}

export async function atualizarInscrito(eventoId: string, id: string, _: EstadoInscrito, form: FormData): Promise<EstadoInscrito> {
  await exigirPerfil("editar_inscrito");
  const evento = await obterEvento(eventoId);
  if (!evento) return { erro: "Evento não encontrado." };

  const nome = schemaNome.safeParse(form.get("nome_completo") ?? "");
  const apelido = schemaApelido.safeParse(form.get("apelido") ?? "");
  const nascimento = schemaNascimento.safeParse(form.get("data_nascimento") ?? "");
  const whatsappBruto = String(form.get("whatsapp") ?? "").trim();
  const whatsapp = whatsappBruto ? schemaWhatsapp.safeParse(whatsappBruto) : null;

  const erros: Record<string, string> = {};
  if (!nome.success) erros.nome_completo = primeiraMensagem(nome);
  if (!apelido.success) erros.apelido = primeiraMensagem(apelido);
  if (!nascimento.success) erros.data_nascimento = primeiraMensagem(nascimento);
  if (whatsapp && !whatsapp.success) erros.whatsapp = primeiraMensagem(whatsapp);
  if (Object.keys(erros).length) return { erros, erro: "Confira os campos destacados." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("inscritos")
    .update({
      nome_completo: nome.data!,
      apelido: apelido.data || null,
      data_nascimento: nascimento.data!,
      idade: calcularIdade(nascimento.data!, evento.data_evento),
      whatsapp: whatsapp?.success ? whatsapp.data : null,
    })
    .eq("id", id)
    .eq("evento_id", eventoId);
  if (error) {
    if (error.message.includes("nome_normalizado")) return { erros: { nome_completo: "Já existe um inscrito com este nome." }, erro: "Confira os campos." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }
  revalidatePath(`/painel/eventos/${eventoId}/inscritos`);
  return { ok: "Dados salvos." };
}

export async function definirComida(eventoId: string, id: string, _: EstadoInscrito, form: FormData): Promise<EstadoInscrito> {
  await exigirPerfil("editar_inscrito");
  const tipo = String(form.get("tipo") ?? "");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("painel_definir_comida", { p_inscrito_id: id, p_tipo: tipo });
  if (error) {
    const codigo = error.message;
    if (codigo === "estoque_comida") return { erro: "Esse tipo já atingiu o limite. Aumente o limite do evento ou escolha outro." };
    if (codigo === "comida_idade") return { erro: "Comida e bebida só para maiores de 12 anos." };
    return { erro: `Não foi possível salvar: ${codigo}` };
  }
  revalidatePath(`/painel/eventos/${eventoId}/inscritos/${id}`);
  return { ok: "Comida atualizada." };
}

export async function removerParticipacao(eventoId: string, id: string, participacaoId: string): Promise<void> {
  await exigirPerfil("editar_inscrito");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("participantes").delete().eq("participacao_id", participacaoId).eq("inscrito_id", id);
  if (error) throw new Error(`Não foi possível remover: ${error.message}`);
  revalidatePath(`/painel/eventos/${eventoId}/inscritos/${id}`);
}

/* Remove o inscrito; se for principal, cônjuge e filhos cadastrados por ele vão junto (cascade). */
export async function excluirInscrito(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("editar_inscrito");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("inscritos").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
  revalidatePath(`/painel/eventos/${eventoId}/inscritos`);
  redirect(`/painel/eventos/${eventoId}/inscritos`);
}

/* Reenvio manual da confirmação (operador ou administrador). */
export async function reenviarConfirmacao(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("reenviar_whatsapp");
  const supabase = await criarClienteServidor();
  const { data: inscrito } = await supabase.from("inscritos").select("whatsapp").eq("id", id).single();
  if (!inscrito?.whatsapp) throw new Error("Este inscrito não tem WhatsApp cadastrado.");
  const { error } = await supabase.from("avisos_whatsapp").insert({
    evento_id: eventoId,
    inscrito_id: id,
    tipo: "confirmacao_inscricao",
    telefone: inscrito.whatsapp,
    chave_idempotencia: `reenvio:${id}:${Date.now()}`,
  });
  if (error) throw new Error(`Não foi possível enfileirar: ${error.message}`);
  after(() => processarPendentes(5).catch((e) => console.error("[whatsapp] reenvio", e)));
  revalidatePath(`/painel/eventos/${eventoId}/inscritos/${id}`);
}
