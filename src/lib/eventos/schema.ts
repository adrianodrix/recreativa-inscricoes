import { z } from "zod";
import { localParaIso } from "@/lib/datas";
import { textoRicoObrigatorio, textoRicoOpcional } from "@/lib/texto-rico/campo";
import { gerarSlug, slugValido } from "./slug";

export { ROTULO_COMIDA, TIPOS_COMIDA, type TipoComida } from "./comida";

const inteiro = (min: number, msg: string) => z.coerce.number().int(msg).min(min, msg);

/* Campo opcional de número inteiro: em branco ou ausente vira null. */
const inteiroOpcional = (msg: string) =>
  z.string().optional().transform((v, ctx): number | null => {
    const texto = (v ?? "").trim();
    if (!texto) return null;
    const n = Number(texto);
    if (!Number.isInteger(n) || n < 1) {
      ctx.addIssue({ code: "custom", message: msg });
      return z.NEVER;
    }
    return n;
  });

/* Texto curto opcional: em branco ou ausente vira null. */
const textoCurto = (max: number, msg: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim())
    .refine((v) => v.length <= max, msg)
    .transform((v) => v || null);

export const campoHora = z.string().regex(/^\d{2}:\d{2}$/, "Informe a hora (hh:mm)");
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

export const schemaEvento = z
  .object({
    nome: z.string().trim().min(3, "Informe o nome (mínimo 3 letras)").max(120, "Nome muito longo"),
    slug: z
      .string()
      .trim()
      .transform((v) => (v ? gerarSlug(v) : ""))
      .refine((v) => v === "" || slugValido(v), "Link inválido ou reservado"),
    data_evento: z.iso.date("Informe a data do evento"),
    hora_inicio: campoHora,
    hora_fim: campoHora,
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
    agradecimento: textoRicoObrigatorio("Preencha este texto"),
    recomendacoes: textoRicoOpcional,
    edicao: inteiroOpcional("Informe o número da edição"),
    subtitulo: textoCurto(80, "Subtítulo muito longo"),
    descricao: textoCurto(300, "Descrição muito longa"),
    link_fotos: z
      .string()
      .optional()
      .transform((v) => (v ?? "").trim() || null)
      .refine((v) => v === null || /^https:\/\//.test(v), "O link das fotos precisa começar com https://"),
    regras_gerais: textoRicoOpcional,
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
