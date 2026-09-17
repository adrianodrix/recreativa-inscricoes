"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { processarPendentes } from "@/lib/whatsapp/outbox";
import { exigirPerfil } from "@/lib/auth/perfil";
import { errosPorCampo } from "@/lib/eventos/schema";
import { proximaOrdem } from "@/lib/supabase/ordem";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { carregarMontagem } from "@/lib/times/consultas";
import { montarTimes } from "@/lib/times/montar";
import { paletaPorOrdem } from "@/lib/times/paleta";
import { novaSemente } from "@/lib/times/rng";
import { schemaTime } from "@/lib/times/schema";
import type { Alocacao, ResultadoMontagem } from "@/lib/times/tipos";

export interface EstadoFormTime {
  erros?: Record<string, string>;
  erro?: string;
}

const rota = (eventoId: string) => `/painel/eventos/${eventoId}/times`;

export async function salvarTime(eventoId: string, id: string | null, _: EstadoFormTime, form: FormData): Promise<EstadoFormTime> {
  await exigirPerfil("gerir_times");
  const dados = schemaTime.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erros: errosPorCampo(dados.error), erro: "Confira os campos." };
  const supabase = await criarClienteServidor();
  const linha = { ...dados.data, evento_id: eventoId };
  let error;
  let timeId = id;
  if (id) {
    ({ error } = await supabase.from("times").update(linha).eq("id", id).eq("evento_id", eventoId));
  } else {
    // Entra no fim da lista; a cor e o ícone padrão vêm da posição e ficam fixos depois.
    const ordem = await proximaOrdem(supabase, "times", eventoId);
    const paleta = paletaPorOrdem(ordem);
    const criado = await supabase.from("times").insert({ ...linha, ordem, cor_padrao: paleta.cor, icone_padrao: paleta.icone }).select("id").single();
    error = criado.error;
    timeId = criado.data?.id ?? null;
  }
  if (error) {
    if (error.message.includes("times_evento_id_nome_key")) return { erros: { nome: "Já existe um time com esse nome." }, erro: "Confira os campos." };
    return { erro: `Não foi possível salvar: ${error.message}` };
  }
  revalidatePath(rota(eventoId));
  redirect(`${rota(eventoId)}/${timeId}?salvo=1`);
}

/* Grava a ordem de exibição na sequência em que os ids chegam. */
export async function reordenarTimes(eventoId: string, ids: string[]): Promise<void> {
  await exigirPerfil("gerir_times");
  const supabase = await criarClienteServidor();
  const resultados = await Promise.all(ids.map((id, i) => supabase.from("times").update({ ordem: i }).eq("id", id).eq("evento_id", eventoId)));
  const falha = resultados.find((r) => r.error)?.error;
  if (falha) throw new Error(`Não foi possível reordenar: ${falha.message}`);
  revalidatePath(rota(eventoId));
}

export async function excluirTime(eventoId: string, id: string): Promise<void> {
  await exigirPerfil("gerir_times");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("times").delete().eq("id", id).eq("evento_id", eventoId);
  if (error) throw new Error(`Não foi possível excluir: ${error.message}`);
  revalidatePath(rota(eventoId));
  redirect(rota(eventoId));
}

/* Monta (ou remonta com nova semente) sem gravar: o quadro mostra e o administrador salva. */
export async function montarTimesAction(eventoId: string, semente?: number): Promise<ResultadoMontagem> {
  await exigirPerfil("gerir_times");
  const { entrada } = await carregarMontagem(eventoId, null);
  return montarTimes({ ...entrada, semente: semente ?? novaSemente() });
}

export type ResultadoAcao = { ok: true; mensagem: string } | { ok: false; erro: string };

const MENSAGENS: Record<string, string> = {
  inscricoes_abertas: "Encerre as inscrições antes de confirmar a montagem.",
  times_insuficientes: "Cadastre pelo menos 2 times.",
  montagem_vazia: "Monte ou salve os times antes de confirmar.",
  inscrito_nao_elegivel: "A alocação inclui alguém que não entra em times (só crianças e jovens).",
  time_invalido: "A alocação aponta para um time que não existe mais. Recarregue a página.",
  sem_permissao: "Só administradores podem gerenciar times.",
};

export async function salvarAlocacaoAction(eventoId: string, alocacao: Alocacao, semente: number): Promise<ResultadoAcao> {
  await exigirPerfil("gerir_times");
  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("salvar_montagem", { p_evento_id: eventoId, p_alocacao: alocacao as Json, p_semente: semente });
  if (error) return { ok: false, erro: MENSAGENS[error.message] ?? `Não foi possível salvar: ${error.message}` };
  revalidatePath(rota(eventoId));
  return { ok: true, mensagem: "Montagem salva como rascunho." };
}

/* Salva e confirma (T9). Devolve quantos inscritos precisam de aviso; o envio é da fase de WhatsApp. */
export async function confirmarMontagemAction(eventoId: string, alocacao: Alocacao, semente: number): Promise<ResultadoAcao> {
  await exigirPerfil("gerir_times");
  const salvo = await salvarAlocacaoAction(eventoId, alocacao, semente);
  if (!salvo.ok) return salvo;
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("confirmar_montagem", { p_evento_id: eventoId });
  if (error) return { ok: false, erro: MENSAGENS[error.message] ?? `Não foi possível confirmar: ${error.message}` };
  revalidatePath(rota(eventoId));
  const afetados = data ?? [];
  let avisos = 0;
  if (afetados.length > 0) {
    const { data: qtd, error: erroFila } = await supabase.rpc("enfileirar_avisos_times", { p_evento_id: eventoId, p_inscritos: afetados });
    if (erroFila) return { ok: false, erro: `Montagem confirmada, mas os avisos não foram enfileirados: ${erroFila.message}` };
    avisos = qtd ?? 0;
    after(() => processarPendentes(20).catch((e) => console.error("[whatsapp] times", e)));
  }
  return { ok: true, mensagem: avisos === 0 ? "Montagem confirmada. Ninguém mudou de time desde o último aviso." : `Montagem confirmada. ${avisos} ${avisos === 1 ? "mensagem enfileirada" : "mensagens enfileiradas"} no WhatsApp.` };
}
