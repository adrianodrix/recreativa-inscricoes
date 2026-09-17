/* Validação dos itens da página inicial (P8–P11), nos formulários do painel. */
import { z } from "zod";
import { campoHora } from "@/lib/eventos/schema";
import { normalizarWhatsapp } from "@/lib/pessoas/whatsapp";
import { textoRicoObrigatorio } from "@/lib/texto-rico/campo";

export const schemaItemProgramacao = z
  .object({
    hora_inicio: campoHora,
    hora_fim: z
      .string()
      .trim()
      .transform((v) => v || null)
      .refine((v) => v === null || /^\d{2}:\d{2}$/.test(v), "Informe a hora (hh:mm)"),
    titulo: z.string().trim().min(2, "Informe o título").max(80, "Título muito longo"),
    detalhe: z.string().trim().max(120, "Detalhe muito longo").transform((v) => v || null),
    brincadeira_id: z.string().trim().transform((v) => v || null),
    destaque: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  })
  .refine((d) => d.hora_fim === null || d.hora_fim > d.hora_inicio, {
    path: ["hora_fim"],
    message: "O fim deve ser depois do início",
  });

export const schemaPergunta = z.object({
  pergunta: z.string().trim().min(5, "Escreva a pergunta").max(160, "Pergunta muito longa"),
  resposta: textoRicoObrigatorio("Escreva a resposta"),
});

export const schemaContato = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(60, "Nome muito longo"),
  whatsapp: z.string().transform((v, ctx) => {
    const numero = normalizarWhatsapp(v);
    if (!numero) {
      ctx.addIssue({ code: "custom", message: "Informe o WhatsApp com DDD, ex.: (44) 99999-9999" });
      return z.NEVER;
    }
    return numero;
  }),
});

export type DadosItemProgramacao = z.infer<typeof schemaItemProgramacao>;
export type DadosPergunta = z.infer<typeof schemaPergunta>;
export type DadosContato = z.infer<typeof schemaContato>;
