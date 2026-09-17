import { DRAFT_INICIAL, type InscricaoDraft } from "./tipos";

export type Direcao = "avancar" | "voltar";

export interface EstadoFormulario {
  draft: InscricaoDraft;
  etapaAtualId: string;
  direcao: Direcao;
  errosServidor: Record<string, string>;
}

export type AcaoFormulario =
  | { tipo: "ATUALIZAR_DRAFT"; draft: InscricaoDraft }
  | { tipo: "IR_PARA"; etapaId: string; direcao: Direcao }
  | { tipo: "ERRO_SERVIDOR"; etapaId: string; mensagem: string }
  | { tipo: "LIMPAR_ERRO"; etapaId: string }
  | { tipo: "HIDRATAR"; estado: EstadoFormulario };

export function estadoInicial(primeiraEtapaId: string): EstadoFormulario {
  return { draft: DRAFT_INICIAL, etapaAtualId: primeiraEtapaId, direcao: "avancar", errosServidor: {} };
}

export function reducer(estado: EstadoFormulario, acao: AcaoFormulario): EstadoFormulario {
  switch (acao.tipo) {
    case "ATUALIZAR_DRAFT":
      return { ...estado, draft: acao.draft };
    case "IR_PARA":
      return { ...estado, etapaAtualId: acao.etapaId, direcao: acao.direcao };
    case "ERRO_SERVIDOR":
      return {
        ...estado,
        etapaAtualId: acao.etapaId,
        direcao: "voltar",
        errosServidor: { ...estado.errosServidor, [acao.etapaId]: acao.mensagem },
      };
    case "LIMPAR_ERRO": {
      if (!(acao.etapaId in estado.errosServidor)) return estado;
      const { [acao.etapaId]: _removido, ...resto } = estado.errosServidor;
      void _removido;
      return { ...estado, errosServidor: resto };
    }
    case "HIDRATAR":
      return acao.estado;
  }
}
