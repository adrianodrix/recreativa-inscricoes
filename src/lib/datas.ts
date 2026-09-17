/* Datas e horas no fuso do evento (America/Sao_Paulo, sem horário de verão desde 2019). */
export const FUSO = "America/Sao_Paulo";
const OFFSET = "-03:00";

/* "2026-09-01T08:00" (input datetime-local, hora de Brasília) → ISO com fuso. */
export function localParaIso(datetimeLocal: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(datetimeLocal)) throw new Error(`Data/hora inválida: ${datetimeLocal}`);
  return `${datetimeLocal}:00${OFFSET}`;
}

/* ISO (qualquer fuso) → "2026-09-01T08:00" em hora de Brasília, para preencher inputs. */
export function isoParaLocal(iso: string): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
}

/* "2026-09-01" → "01/09/2026" */
export function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* "2026-09-01" → "terça-feira, 1 de setembro de 2026" */
export function formatarDataExtenso(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", dateStyle: "full" }).format(
    new Date(Date.UTC(ano, mes - 1, dia)),
  );
}

/* "08:30:00" ou "08:30" → "08:30" */
export function formatarHora(hora: string): string {
  return hora.slice(0, 5);
}

/* ISO → "01/09/2026 08:00" em hora de Brasília */
export function formatarDataHora(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

/* Valor em reais para exibição: 0 → "Gratuito" */
export function formatarValor(valor: number): string {
  if (valor === 0) return "Gratuito";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor).replace(/\u00a0/g, " ");
}
