"use server";

import { after } from "next/server";
import { processarPendentes } from "@/lib/whatsapp/outbox";
import type { ResultadoEnvio } from "@/features/inscricao/modelo/erros";
import { schemaPayload, type PayloadInscricao } from "@/features/inscricao/modelo/payload";
import type { PessoaEncontrada } from "@/components/inscricao/PersonSearch";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

export async function detalheDe(texto: string | null | undefined): Promise<Record<string, unknown>> {
  if (!texto) return {};
  try {
    const v = JSON.parse(texto);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/* Grava a inscrição inteira de uma vez pela RPC atômica. */
export async function enviarInscricao(payload: PayloadInscricao): Promise<ResultadoEnvio> {
  const dados = schemaPayload.safeParse(payload);
  if (!dados.success) return { ok: false, erro: { codigo: "payload_invalido", detalhe: {} } };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.rpc("criar_inscricao", { p: dados.data as unknown as Json });
  if (error) return { ok: false, erro: { codigo: error.message, detalhe: await detalheDe(error.details) } };
  after(() => processarPendentes(5).catch((e) => console.error("[whatsapp] confirmação", e)));
  return { ok: true };
}

export async function verificarNome(eventoId: string, nome: string): Promise<boolean> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("verificar_nome_disponivel", { p_evento_id: eventoId, p_nome: nome });
  if (error) return true; // em caso de falha, a RPC final ainda valida
  return Boolean(data);
}

export async function buscarResponsaveis(eventoId: string, brincadeiraId: string, termo: string): Promise<PessoaEncontrada[]> {
  if (termo.trim().length < 3) return [];
  const supabase = await criarClienteServidor();
  const { data } = await supabase.rpc("buscar_jovens_livres", { p_evento_id: eventoId, p_brincadeira_id: brincadeiraId, p_termo: termo });
  return data ?? [];
}
