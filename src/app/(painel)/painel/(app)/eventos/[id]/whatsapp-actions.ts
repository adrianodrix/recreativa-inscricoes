"use server";

import { revalidatePath } from "next/cache";
import { exigirPerfil } from "@/lib/auth/perfil";
import { processarPendentes } from "@/lib/whatsapp/outbox";

/* Botão "Processar fila": caminho manual (e o único em dev sem pg_cron alcançando o app). */
export async function processarFilaAction(eventoId: string): Promise<void> {
  await exigirPerfil("reenviar_whatsapp");
  await processarPendentes(50);
  revalidatePath(`/painel/eventos/${eventoId}`);
}
