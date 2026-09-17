import { z } from "zod";
import { dataIsoValida } from "@/lib/pessoas/idade";
import { validarNomeCompleto, type ProblemaNome } from "@/lib/pessoas/nome";

const MENSAGEM_NOME: Record<ProblemaNome, string> = {
  curto: "Escreva o nome completo (mínimo 10 letras).",
  numeros: "O nome não pode ter números.",
  incompleto: "Informe nome e sobrenome.",
};

export const schemaNome = z
  .string()
  .trim()
  .superRefine((v, ctx) => {
    const problema = validarNomeCompleto(v);
    if (problema) ctx.addIssue({ code: "custom", message: MENSAGEM_NOME[problema] });
  });

export const schemaApelido = z.string().trim().max(40, "Apelido muito longo");

export const schemaNascimento = z
  .string()
  .refine(dataIsoValida, "Informe uma data válida.")
  .refine((v) => v <= new Date().toISOString().slice(0, 10), "A data não pode ser no futuro.")
  .refine((v) => v >= "1900-01-01", "Confira o ano.");

/* Aceita (11) 99999-9999, 11999999999, +55 11 99999-9999; devolve 55DDDN… */
export function normalizarWhatsapp(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) digitos = digitos.slice(2);
  if (digitos.length < 10 || digitos.length > 11) return null;
  if (!/^[1-9]{2}/.test(digitos)) return null;
  if (digitos.length === 11 && digitos[2] !== "9") return null;
  return `55${digitos}`;
}

export const schemaWhatsapp = z
  .string()
  .transform((v, ctx) => {
    const n = normalizarWhatsapp(v);
    if (!n) ctx.addIssue({ code: "custom", message: "Informe o WhatsApp com DDD, ex.: (11) 99999-9999." });
    return n ?? "";
  });

export function formatarWhatsapp(digitos: string): string {
  const d = digitos.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}

export function primeiraMensagem(resultado: { success: false; error: z.ZodError }): string {
  return resultado.error.issues[0]?.message ?? "Valor inválido.";
}
