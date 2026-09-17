import { conjugeCadastrado, filhosCadastrados, pessoasDoDraft } from "./regras";
import type { EventoPublico, InscricaoDraft, PessoaKey, TipoComida } from "./tipos";

/* Contrato da RPC public.criar_inscricao (migration 0007). Validado no servidor por payload-schema.ts. */
export type SituacaoDependente = "cadastrado" | "vai_se_cadastrar" | "nao_quer_cadastrar";

export interface PessoaPayload {
  nome_completo: string;
  data_nascimento: string;
  comida?: TipoComida;
}

export type ParticipacaoPayload =
  | { tipo: "pessoa"; brincadeira_id: string; pessoa: string }
  | { tipo: "casal"; brincadeira_id: string }
  | { tipo: "dupla"; brincadeira_id: string; filho: string; parceiro: "principal" | "conjuge" | { responsavel_id: string }; papel: "pai" | "mae" | "responsavel" };

export interface PayloadInscricao {
  evento_id: string;
  principal: PessoaPayload & {
    apelido?: string;
    casado: boolean;
    tem_filhos_menores: boolean;
    conjuge_situacao?: SituacaoDependente;
    filhos_situacao?: SituacaoDependente;
    whatsapp?: string;
  };
  conjuge?: PessoaPayload;
  filhos: Array<PessoaPayload & { ref: string }>;
  participacoes: ParticipacaoPayload[];
}

export function refDe(key: PessoaKey): string {
  if (key === "principal" || key === "conjuge") return key;
  return `f${Number(key.split(":")[1]) + 1}`;
}

export function keyDeRef(ref: string): PessoaKey | null {
  if (ref === "principal" || ref === "conjuge") return ref;
  const m = /^f(\d+)$/.exec(ref);
  return m ? `filho:${Number(m[1]) - 1}` : null;
}

const SITUACAO = { sim: "cadastrado", nao_cadastrar: "nao_quer_cadastrar", vai_se_cadastrar: "vai_se_cadastrar" } as const;

/* Só o que está visível no fluxo entra no payload (respostas antigas ficam no rascunho). */
export function montarPayload(d: InscricaoDraft, evento: EventoPublico): PayloadInscricao {
  const visiveis = new Set(pessoasDoDraft(d, evento).map((p) => p.key));
  const comidaDe = (key: PessoaKey) => (visiveis.has(key) ? d.comida[key] : undefined);
  const casado = Boolean(d.principal.casado);

  return {
    evento_id: evento.id,
    principal: {
      nome_completo: d.principal.nome.trim(),
      data_nascimento: d.principal.nascimento,
      apelido: d.principal.apelido?.trim() || undefined,
      casado,
      tem_filhos_menores: casado && Boolean(d.temFilhosMenores),
      conjuge_situacao: casado && d.conjugeOpcao ? SITUACAO[d.conjugeOpcao] : undefined,
      filhos_situacao: casado && d.temFilhosMenores && d.filhosOpcao ? SITUACAO[d.filhosOpcao] : undefined,
      whatsapp: d.participacoes.length > 0 ? d.whatsapp : undefined,
      comida: comidaDe("principal"),
    },
    conjuge:
      conjugeCadastrado(d) && d.conjuge
        ? { nome_completo: d.conjuge.nome.trim(), data_nascimento: d.conjuge.nascimento, comida: comidaDe("conjuge") }
        : undefined,
    filhos: filhosCadastrados(d)
      ? d.filhos.map((f, i) => ({
          ref: refDe(`filho:${i}`),
          nome_completo: f.nome.trim(),
          data_nascimento: f.nascimento,
          comida: comidaDe(`filho:${i}`),
        }))
      : [],
    participacoes: d.participacoes.flatMap((p): ParticipacaoPayload[] => {
      if ("casal" in p) return visiveis.has("conjuge") ? [{ tipo: "casal" as const, brincadeira_id: p.brincadeiraId }] : [];
      if ("pessoa" in p) return visiveis.has(p.pessoa) ? [{ tipo: "pessoa" as const, brincadeira_id: p.brincadeiraId, pessoa: refDe(p.pessoa) }] : [];
      if (!visiveis.has(p.filho)) return [];
      return [
        p.parceiro.tipo === "pai_mae"
          ? { tipo: "dupla" as const, brincadeira_id: p.brincadeiraId, filho: refDe(p.filho), parceiro: p.parceiro.pessoa, papel: p.parceiro.papel }
          : { tipo: "dupla" as const, brincadeira_id: p.brincadeiraId, filho: refDe(p.filho), parceiro: { responsavel_id: p.parceiro.inscritoId }, papel: "responsavel" as const },
      ];
    }),
  };
}
