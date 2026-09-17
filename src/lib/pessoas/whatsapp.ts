/* Telefone de WhatsApp no formato gravado no banco: 55 + DDD + número. */

/* Aceita (11) 99999-9999, 11999999999, +55 11 99999-9999; devolve 55DDDN… */
export function normalizarWhatsapp(entrada: string): string | null {
  let digitos = entrada.replace(/\D/g, "");
  if (digitos.startsWith("55") && digitos.length >= 12) digitos = digitos.slice(2);
  if (digitos.length < 10 || digitos.length > 11) return null;
  if (!/^[1-9]{2}/.test(digitos)) return null;
  if (digitos.length === 11 && digitos[2] !== "9") return null;
  return `55${digitos}`;
}

/* 5511999999999 → (11) 99999-9999 */
export function formatarWhatsapp(digitos: string): string {
  const d = digitos.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digitos;
}
