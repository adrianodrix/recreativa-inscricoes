import { after, NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { processarPendentes } from "@/lib/whatsapp/outbox";

export const maxDuration = 60;

/* Acordado pelo pg_cron (a cada minuto) ou pelo app; protegido por CRON_SECRET. */
export async function POST(request: NextRequest) {
  const segredo = env().CRON_SECRET;
  if (!segredo) return NextResponse.json({ erro: "CRON_SECRET não configurado" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  after(async () => {
    try {
      const resumo = await processarPendentes(20);
      if (resumo.processados > 0) console.info("[whatsapp] fila processada", resumo);
    } catch (e) {
      console.error("[whatsapp] falha no worker", e);
    }
  });
  return NextResponse.json({ ok: true }, { status: 202 });
}
