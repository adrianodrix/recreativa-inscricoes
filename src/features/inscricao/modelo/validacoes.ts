/* Validações das etapas, sem zod: o formulário público precisa ser leve. */
import { dataIsoValida } from "@/lib/pessoas/idade";
import { validarNomeCompleto, type ProblemaNome } from "@/lib/pessoas/nome";

export type Validado<T> = { ok: true; valor: T } | { ok: false; erro: string };

const MENSAGEM_NOME: Record<ProblemaNome, string> = {
  curto: "Escreva o nome completo (mínimo 10 letras).",
  numeros: "O nome não pode ter números.",
  incompleto: "Informe nome e sobrenome.",
};

export function validarNome(valor: string): Validado<string> {
  const limpo = valor.trim().replace(/\s+/g, " ");
  const problema = validarNomeCompleto(limpo);
  return problema ? { ok: false, erro: MENSAGEM_NOME[problema] } : { ok: true, valor: limpo };
}

export function validarApelido(valor: string): Validado<string> {
  const limpo = valor.trim();
  return limpo.length > 40 ? { ok: false, erro: "Apelido muito longo" } : { ok: true, valor: limpo };
}

export function validarNascimento(valor: string): Validado<string> {
  if (!dataIsoValida(valor)) return { ok: false, erro: "Informe uma data válida." };
  if (valor > new Date().toISOString().slice(0, 10)) return { ok: false, erro: "A data não pode ser no futuro." };
  if (valor < "1900-01-01") return { ok: false, erro: "Confira o ano." };
  return { ok: true, valor };
}

/* Aceita (11) 99999-9999, 11999999999, +55 11 99999-9999; devolve 55DDDN… */
export function normalizarWhatsapp(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) digitos = digitos.slice(2);
  if (digitos.length < 10 || digitos.length > 11) return null;
  if (!/^[1-9]{2}/.test(digitos)) return null;
  if (digitos.length === 11 && digitos[2] !== "9") return null;
  return `55${digitos}`;
}

export function validarWhatsapp(valor: string): Validado<string> {
  const n = normalizarWhatsapp(valor);
  return n ? { ok: true, valor: n } : { ok: false, erro: "Informe o WhatsApp com DDD, ex.: (11) 99999-9999." };
}

export function formatarWhatsapp(digitos: string): string {
  const d = digitos.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}
