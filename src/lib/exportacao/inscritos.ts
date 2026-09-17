import { formatarData, formatarDataHora } from "@/lib/datas";
import { ROTULO_COMIDA } from "@/lib/eventos/schema";
import type { InscritoResumo } from "@/lib/inscritos/consultas";

export const COLUNAS = [
  "Nome completo",
  "Apelido",
  "Nascimento",
  "Idade no evento",
  "Vínculo",
  "Inscrito principal",
  "Casado",
  "WhatsApp",
  "Comida/bebida",
  "Brincadeiras",
  "Inscrito em",
] as const;

const VINCULO = { principal: "Principal", conjuge: "Cônjuge", filho: "Filho(a)" } as const;
const PAPEL = { pessoa: "", conjuge: "casal", filho: "filho", pai: "pai", mae: "mãe", responsavel: "responsável" } as const;

/* Uma linha por inscrito, pronta para CSV ou XLSX. */
export function linhasExportacao(inscritos: InscritoResumo[]): string[][] {
  return inscritos.map((i) => [
    i.nome_completo,
    i.apelido ?? "",
    formatarData(i.data_nascimento),
    String(i.idade),
    VINCULO[i.vinculo],
    i.principal_nome ?? "",
    i.casado ? "Sim" : "Não",
    i.whatsapp ?? "",
    i.comida ? ROTULO_COMIDA[i.comida] : "",
    i.participacoes.map((p) => (PAPEL[p.papel] ? `${p.brincadeira} (${PAPEL[p.papel]})` : p.brincadeira)).join("; "),
    formatarDataHora(i.inscrito_em),
  ]);
}
