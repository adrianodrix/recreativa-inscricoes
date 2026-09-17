import "server-only";
import { z } from "zod";

/* Variáveis de servidor, validadas uma vez no primeiro uso. */
const schema = z.object({
  APP_URL: z.url().default("http://localhost:3000"),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
  EVOLUTION_API_URL: z.url().optional(),
  EVOLUTION_API_KEY: z.string().min(1).optional(),
  EVOLUTION_INSTANCE: z.string().min(1).optional(),
  WHATSAPP_ENVIO_ATIVO: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

export type Env = z.infer<typeof schema>;

let cache: Env | undefined;

export function env(): Env {
  if (cache) return cache;
  const resultado = schema.safeParse(process.env);
  if (!resultado.success) {
    const problemas = resultado.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Variáveis de ambiente inválidas:\n${problemas.join("\n")}`);
  }
  cache = resultado.data;
  return cache;
}
