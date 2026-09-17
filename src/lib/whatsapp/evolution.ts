import "server-only";
import { env } from "@/lib/env";

export type ResultadoEnvioTexto = { ok: true; id: string } | { ok: false; erro: string; retentavel: boolean };

export function whatsappConfigurado(): boolean {
  const e = env();
  return Boolean(e.EVOLUTION_API_URL && e.EVOLUTION_API_KEY && e.EVOLUTION_INSTANCE);
}

function base() {
  const e = env();
  if (!e.EVOLUTION_API_URL || !e.EVOLUTION_API_KEY || !e.EVOLUTION_INSTANCE) throw new Error("Evolution API não configurada");
  return { url: e.EVOLUTION_API_URL.replace(/\/$/, ""), chave: e.EVOLUTION_API_KEY, instancia: e.EVOLUTION_INSTANCE };
}

/* Evolution API v2: POST /message/sendText/{instancia} com header apikey. */
export async function enviarTexto(numero: string, texto: string): Promise<ResultadoEnvioTexto> {
  const { url, chave, instancia } = base();
  const controle = new AbortController();
  const timeout = setTimeout(() => controle.abort(), 15000);
  try {
    const resposta = await fetch(`${url}/message/sendText/${encodeURIComponent(instancia)}`, {
      method: "POST",
      headers: { apikey: chave, "Content-Type": "application/json" },
      body: JSON.stringify({ number: numero, text: texto }),
      signal: controle.signal,
    });
    const corpo = (await resposta.json().catch(() => ({}))) as { key?: { id?: string }; message?: string; response?: { message?: unknown } };
    if (!resposta.ok) {
      const detalhe = corpo.message ?? JSON.stringify(corpo.response?.message ?? corpo);
      return { ok: false, erro: `HTTP ${resposta.status}: ${detalhe}`, retentavel: resposta.status >= 500 || resposta.status === 429 };
    }
    return { ok: true, id: corpo.key?.id ?? "" };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Falha de rede", retentavel: true };
  } finally {
    clearTimeout(timeout);
  }
}

export type EstadoConexao = "open" | "close" | "connecting" | "desconhecido";

export async function estadoConexao(): Promise<EstadoConexao> {
  try {
    const { url, chave, instancia } = base();
    const resposta = await fetch(`${url}/instance/connectionState/${encodeURIComponent(instancia)}`, {
      headers: { apikey: chave },
      signal: AbortSignal.timeout(8000),
    });
    const corpo = (await resposta.json()) as { instance?: { state?: string } };
    const estado = corpo.instance?.state;
    return estado === "open" || estado === "close" || estado === "connecting" ? estado : "desconhecido";
  } catch {
    return "desconhecido";
  }
}
