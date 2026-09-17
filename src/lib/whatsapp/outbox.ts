import "server-only";
import { env } from "@/lib/env";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { montarMensagem } from "./contexto";
import { enviarTexto, whatsappConfigurado } from "./evolution";

const MAX_TENTATIVAS = 5;
const BACKOFF_MINUTOS = [1, 5, 30, 60, 120];
const PAUSA_ENTRE_ENVIOS_MS = 1500;

export interface ResumoProcessamento {
  processados: number;
  enviados: number;
  reagendados: number;
  falhas: number;
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/*
 * Worker da fila: reserva um lote (skip locked), monta cada mensagem com o estado
 * atual do banco e envia pela Evolution API. Com WHATSAPP_ENVIO_ATIVO=false, só simula.
 */
export async function processarPendentes(limite = 20): Promise<ResumoProcessamento> {
  const admin = criarClienteAdmin();
  const resumo: ResumoProcessamento = { processados: 0, enviados: 0, reagendados: 0, falhas: 0 };
  const { data: lote, error } = await admin.rpc("reservar_avisos", { p_limite: limite });
  if (error) throw new Error(`Falha ao reservar avisos: ${error.message}`);
  const ativo = env().WHATSAPP_ENVIO_ATIVO && whatsappConfigurado();

  for (const aviso of lote ?? []) {
    resumo.processados += 1;
    try {
      const mensagem = await montarMensagem(admin, aviso);
      if (!ativo) {
        await admin.from("avisos_whatsapp").update({ status: "enviado", mensagem, enviado_em: new Date().toISOString(), id_externo: "simulado", erro: null }).eq("id", aviso.id);
        resumo.enviados += 1;
        continue;
      }
      const r = await enviarTexto(aviso.telefone, mensagem);
      if (r.ok) {
        await admin.from("avisos_whatsapp").update({ status: "enviado", mensagem, enviado_em: new Date().toISOString(), id_externo: r.id, erro: null }).eq("id", aviso.id);
        resumo.enviados += 1;
      } else {
        await registrarFalha(admin, aviso.id, aviso.tentativas, r.erro, r.retentavel, resumo);
      }
      await dormir(PAUSA_ENTRE_ENVIOS_MS);
    } catch (e) {
      await registrarFalha(admin, aviso.id, aviso.tentativas, e instanceof Error ? e.message : String(e), false, resumo);
    }
  }
  return resumo;
}

async function registrarFalha(
  admin: ReturnType<typeof criarClienteAdmin>,
  id: string,
  tentativas: number,
  erro: string,
  retentavel: boolean,
  resumo: ResumoProcessamento,
) {
  if (retentavel && tentativas < MAX_TENTATIVAS) {
    const minutos = BACKOFF_MINUTOS[Math.min(tentativas - 1, BACKOFF_MINUTOS.length - 1)];
    await admin
      .from("avisos_whatsapp")
      .update({ status: "pendente", erro, proxima_tentativa_em: new Date(Date.now() + minutos * 60_000).toISOString() })
      .eq("id", id);
    resumo.reagendados += 1;
  } else {
    await admin.from("avisos_whatsapp").update({ status: "falhou", erro }).eq("id", id);
    resumo.falhas += 1;
  }
}
