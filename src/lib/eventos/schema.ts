import { z } from "zod";
import { localParaIso } from "@/lib/datas";
import { schemaTextoRico, textoRicoVazio, type TextoRico } from "@/lib/texto-rico/schema";
import { gerarSlug, slugValido } from "./slug";


export { ROTULO_COMIDA, TIPOS_COMIDA, type TipoComida } from "./comida";

const inteiro = (min: number, msg: string) => z.coerce.number().int(msg).min(min, msg);
const hora = z.string().regex(/^\d{2}:\d{2}$/, "Informe a hora (hh:mm)");
const dataHoraLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe data e hora");

/* "1.234,56" ou "1234.56" → 1234.56 */
const valorReais = z.string().transform((v, ctx) => {
  const limpo = v.trim().replace(/\./g, "").replace(",", ".");
  const n = limpo === "" ? 0 : Number(limpo);
  if (!Number.isFinite(n) || n < 0) {
    ctx.addIssue({ code: "custom", message: "Informe um valor válido (0 = gratuito)" });
    return z.NEVER;
  }
  return Math.round(n * 100) / 100;
});

/* Campo oculto do EditorRico: JSON do documento. Vazio vira null. */
const textoRicoOpcional = z.string().transform((v, ctx): TextoRico | null => {
  if (!v.trim()) return null;
  const parsed = schemaTextoRico.safeParse(JSON.parse(v));
  if (!parsed.success) {
    ctx.addIssue({ code: "custom", message: "Conteúdo com formatação não permitida" });
    return z.NEVER;
  }
  return textoRicoVazio(parsed.data) ? null : parsed.data;
});

const textoRicoObrigatorio = textoRicoOpcional.refine((v): v is TextoRico => v !== null, "Preencha este texto");

export const schemaEvento = z
  .object({
    nome: z.string().trim().min(3, "Informe o nome (mínimo 3 letras)").max(120, "Nome muito longo"),
    slug: z
      .string()
      .trim()
      .transform((v) => (v ? gerarSlug(v) : ""))
      .refine((v) => v === "" || slugValido(v), "Link inválido ou reservado"),
    data_evento: z.iso.date("Informe a data do evento"),
    hora_inicio: hora,
    hora_fim: hora,
    endereco: z.string().trim().min(5, "Informe o endereço"),
    link_maps: z.url("Informe o link do Google Maps").refine((v) => v.startsWith("https://"), "O link precisa começar com https://"),
    inscricoes_inicio: dataHoraLocal.transform(localParaIso),
    inscricoes_fim: dataHoraLocal.transform(localParaIso),
    aberto_manual: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
    limite_inscritos: inteiro(1, "Informe o limite de inscritos"),
    valor_inscricao: valorReais,
    limite_salgado: inteiro(0, "Informe um número"),
    limite_doce: inteiro(0, "Informe um número"),
    limite_refrigerante: inteiro(0, "Informe um número"),
    limite_suco: inteiro(0, "Informe um número"),
    capa_path: z.string().optional().transform((v) => v || null),
    boas_vindas: textoRicoOpcional,
    agradecimento: textoRicoObrigatorio,
    recomendacoes: textoRicoOpcional,
  })
  .refine((d) => d.hora_fim > d.hora_inicio, { path: ["hora_fim"], message: "O fim deve ser depois do início" })
  .refine((d) => d.inscricoes_fim > d.inscricoes_inicio, {
    path: ["inscricoes_fim"],
    message: "O encerramento deve ser depois da abertura",
  })
  .transform((d) => ({ ...d, slug: d.slug || gerarSlug(d.nome) }));

export type DadosEvento = z.infer<typeof schemaEvento>;

/* Erros do zod → { campo: mensagem } para o formulário. */
export function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "_");
    if (!saida[campo]) saida[campo] = issue.message;
  }
  return saida;
}
