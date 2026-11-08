import type { InscricaoDraft, Participacao, PessoaKey } from "./tipos";

/* Resposta de public.consultar_nome_inscrito: livre, inscrição própria ou cadastrado por um familiar. */
export type SituacaoNome = "livre" | "principal" | "familiar";

export function lerSituacaoNome(valor: unknown): SituacaoNome {
  return valor === "principal" || valor === "familiar" ? valor : "livre";
}

/* Cônjuge que já tem inscrição: segue como "vai se inscrever" e fica fora desta. */
export function seguirSemConjuge(d: InscricaoDraft): InscricaoDraft {
  return { ...d, conjugeOpcao: "vai_se_cadastrar", conjuge: undefined };
}

/* Filho que já tem inscrição: sai desta; se não sobrar nenhum, a opção vira "vão se inscrever". */
export function seguirSemFilho(d: InscricaoDraft, indice: number): InscricaoDraft {
  const novo = removerFilho(d, indice);
  return novo.filhos.length > 0 ? novo : { ...novo, filhosOpcao: "vai_se_cadastrar" };
}

/* Remapeia "filho:N": o removido some (null) e os seguintes descem uma posição. */
function remapear(key: PessoaKey, removido: number): PessoaKey | null {
  if (!key.startsWith("filho:")) return key;
  const n = Number(key.slice("filho:".length));
  if (n === removido) return null;
  return n > removido ? `filho:${n - 1}` : key;
}

function remapearParticipacao(p: Participacao, removido: number): Participacao | null {
  if ("casal" in p) return p;
  if ("pessoa" in p) {
    const pessoa = remapear(p.pessoa, removido);
    return pessoa ? { ...p, pessoa } : null;
  }
  const filho = remapear(p.filho, removido);
  return filho ? { ...p, filho } : null;
}

/* Recusas guardam o id da etapa, que termina na chave da pessoa (ex.: "brincadeira:<id>:filho:2"). */
function remapearRecusa(id: string, removido: number): string | null {
  const m = /^(.*:)?(filho:\d+)$/.exec(id);
  if (!m) return id;
  const key = remapear(m[2] as PessoaKey, removido);
  return key ? `${m[1] ?? ""}${key}` : null;
}

/*
 * Tira o filho do rascunho. As respostas dele (comida, brincadeiras, recusas)
 * saem junto, e as dos filhos seguintes acompanham a nova posição de cada um.
 */
export function removerFilho(d: InscricaoDraft, indice: number): InscricaoDraft {
  const comida: InscricaoDraft["comida"] = {};
  for (const [key, escolha] of Object.entries(d.comida)) {
    const nova = remapear(key as PessoaKey, indice);
    if (nova && escolha) comida[nova] = escolha;
  }
  return {
    ...d,
    filhos: d.filhos.filter((_, i) => i !== indice),
    comida,
    participacoes: d.participacoes.flatMap((p) => remapearParticipacao(p, indice) ?? []),
    recusadas: d.recusadas.flatMap((r) => remapearRecusa(r, indice) ?? []),
  };
}
