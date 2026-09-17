import { z } from "zod";
import { textoRicoObrigatorio } from "@/lib/texto-rico/campo";

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
    regras: textoRicoObrigatorio("Escreva as regras da brincadeira"),
    ativo: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
  })
  .transform((d) => ({ ...d, formato: d.categoria === "casais" ? null : d.formato || "em_grupo" }));

export type DadosBrincadeira = z.infer<typeof schemaBrincadeira>;
