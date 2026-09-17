/* Espelho TypeScript de public.calcular_idade: idade completa na data de referência. */
export function calcularIdade(nascimentoIso: string, referenciaIso: string): number {
  const nascimento = parseIsoDate(nascimentoIso);
  const referencia = parseIsoDate(referenciaIso);
  let idade = referencia.ano - nascimento.ano;
  const aindaNaoFezAniversario =
    referencia.mes < nascimento.mes ||
    (referencia.mes === nascimento.mes && referencia.dia < nascimento.dia);
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}

/* Data no formato yyyy-mm-dd, validada de verdade (rejeita 31/02). */
export function dataIsoValida(valor: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!m) return false;
  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

function parseIsoDate(valor: string): { ano: number; mes: number; dia: number } {
  if (!dataIsoValida(valor)) throw new Error(`Data inválida: ${valor}`);
  const [ano, mes, dia] = valor.split("-").map(Number);
  return { ano, mes, dia };
}
