import { z } from "zod";
import { schemaTextoRico, textoRicoVazio, type TextoRico } from "@/lib/texto-rico/schema";

export const CATEGORIAS = ["casais", "jovens", "criancas", "pais_e_filhos"] as const;
export type Categoria = (typeof CATEGORIAS)[number];
export const ROTULO_CATEGORIA: Record<Categoria, string> = {
  casais: "Casais",
  jovens: "Jovens (solteiros de 9 a 30 anos)",
  criancas: "Crianças (até 8 anos)",
  pais_e_filhos: "Pais e filhos (duplas)",
};
export const UNIDADE_VAGA: Record<Categoria, string> = {
  casais: "casais",
  jovens: "pessoas",
  criancas: "pessoas",
  pais_e_filhos: "duplas",
};

const regras = z.string().transform((v, ctx): TextoRico => {
  const parsed = v.trim() ? schemaTextoRico.safeParse(JSON.parse(v)) : null;
  if (!parsed?.success || textoRicoVazio(parsed.data)) {
    ctx.addIssue({ code: "custom", message: "Escreva as regras da brincadeira" });
    return z.NEVER;
  }
  return parsed.data;
});

export const schemaBrincadeira = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome").max(120, "Nome muito longo"),
    categoria: z.enum(CATEGORIAS, "Escolha a categoria"),
    formato: z.enum(["individual", "em_grupo", ""]).optional(),
    limite_participantes: z.coerce.number().int("Informe um número").min(1, "Informe o limite"),
    video_url: z
      .string()
      .trim()
      .transform((v) => v || null)
      .refine((v) => v === null || /^https:\/\//.test(v), "O link do vídeo precisa começar com https://"),
    foto_path: z.string().transform((v) => v || null),
    regras,
    ativo: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
    ordem: z.coerce.number().int().default(0),
  })
  .transform((d) => ({ ...d, formato: d.categoria === "casais" ? null : d.formato || "em_grupo" }));

export type DadosBrincadeira = z.infer<typeof schemaBrincadeira>;
