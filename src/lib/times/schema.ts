import { z } from "zod";

export const schemaTime = z.object({
  nome: z.string().trim().min(1, "Informe o nome do time").max(60, "Nome muito longo"),
  imagem_path: z.string().optional().transform((v) => v || null),
  ordem: z.coerce.number().int().default(0),
});

export type DadosTime = z.infer<typeof schemaTime>;
