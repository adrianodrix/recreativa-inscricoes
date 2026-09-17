/* Campo oculto do EditorRico nos formulários do painel: JSON do documento. */
import { z } from "zod";
import { schemaTextoRico, textoRicoVazio, type TextoRico } from "./schema";

const MENSAGEM_INVALIDO = "Conteúdo com formatação não permitida";

/* Texto vazio, ausente (ou só com parágrafos em branco) vira null. */
export const textoRicoOpcional = z.string().optional().transform((v, ctx): TextoRico | null => {
  if (!v?.trim()) return null;
  let bruto: unknown;
  try {
    bruto = JSON.parse(v);
  } catch {
    ctx.addIssue({ code: "custom", message: MENSAGEM_INVALIDO });
    return z.NEVER;
  }
  const parsed = schemaTextoRico.safeParse(bruto);
  if (!parsed.success) {
    ctx.addIssue({ code: "custom", message: MENSAGEM_INVALIDO });
    return z.NEVER;
  }
  return textoRicoVazio(parsed.data) ? null : parsed.data;
});

export const textoRicoObrigatorio = (mensagem: string) =>
  textoRicoOpcional.refine((v): v is TextoRico => v !== null, mensagem);
