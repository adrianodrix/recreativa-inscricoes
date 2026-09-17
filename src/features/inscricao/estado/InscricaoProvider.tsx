"use client";

import { addTransitionType, createContext, startTransition, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import { indiceDaEtapa, montarEtapas, type Etapa } from "../modelo/etapas";
import { estadoInicial, reducer, type AcaoFormulario, type Direcao, type EstadoFormulario } from "../modelo/reducer";
import type { ResultadoEnvio } from "../modelo/erros";
import type { PayloadInscricao } from "../modelo/payload";
import type { EventoPublico, InscricaoDraft } from "../modelo/tipos";
import { useRascunho } from "./useRascunho";

export interface ContextoInscricao {
  evento: EventoPublico;
  enviar: (payload: PayloadInscricao) => Promise<ResultadoEnvio>;
  destino: string;
  estado: EstadoFormulario;
  etapas: Etapa[];
  etapaAtual: Etapa;
  indice: number;
  pronto: boolean;
  /* Grava o rascunho (se houver) e avança para a próxima etapa visível. */
  concluir: (novoDraft?: InscricaoDraft) => void;
  atualizar: (novoDraft: InscricaoDraft) => void;
  voltar: () => void;
  irPara: (etapaId: string) => void;
  dispatch: (acao: AcaoFormulario) => void;
}

const Contexto = createContext<ContextoInscricao | null>(null);

interface ProviderProps {
  evento: EventoPublico;
  enviar: (payload: PayloadInscricao) => Promise<ResultadoEnvio>;
  destino: string;
  children: ReactNode;
}

export function InscricaoProvider({ evento, enviar, destino, children }: ProviderProps) {
  const primeira = useMemo(() => montarEtapas({ principal: { nome: "", nascimento: "" }, filhos: [], comida: {}, recusadas: [], participacoes: [] }, evento)[0].id, [evento]);
  const [estado, dispatch] = useReducer(reducer, primeira, estadoInicial);
  const { pronto } = useRascunho(evento, estado, dispatch);

  const etapas = useMemo(() => montarEtapas(estado.draft, evento), [estado.draft, evento]);
  const indiceBruto = indiceDaEtapa(etapas, estado.etapaAtualId);
  const indice = indiceBruto === -1 ? 0 : indiceBruto;
  const etapaAtual = etapas[indice];

  const navegar = useCallback((etapaId: string, direcao: Direcao, novoDraft?: InscricaoDraft) => {
    startTransition(() => {
      addTransitionType(direcao);
      if (novoDraft) dispatch({ tipo: "ATUALIZAR_DRAFT", draft: novoDraft });
      dispatch({ tipo: "IR_PARA", etapaId, direcao });
    });
  }, []);

  const concluir = useCallback(
    (novoDraft?: InscricaoDraft) => {
      const draft = novoDraft ?? estado.draft;
      const novas = montarEtapas(draft, evento);
      const i = indiceDaEtapa(novas, estado.etapaAtualId);
      const proxima = novas[Math.min(i + 1, novas.length - 1)] ?? novas[0];
      dispatch({ tipo: "LIMPAR_ERRO", etapaId: estado.etapaAtualId });
      navegar(proxima.id, "avancar", novoDraft);
    },
    [estado.draft, estado.etapaAtualId, evento, navegar],
  );

  const atualizar = useCallback((novoDraft: InscricaoDraft) => dispatch({ tipo: "ATUALIZAR_DRAFT", draft: novoDraft }), []);

  const voltar = useCallback(() => {
    if (indice > 0) navegar(etapas[indice - 1].id, "voltar");
  }, [etapas, indice, navegar]);

  const irPara = useCallback((etapaId: string) => navegar(etapaId, "voltar"), [navegar]);

  const valor = useMemo<ContextoInscricao>(
    () => ({ evento, enviar, destino, estado, etapas, etapaAtual, indice, pronto, concluir, atualizar, voltar, irPara, dispatch }),
    [evento, enviar, destino, estado, etapas, etapaAtual, indice, pronto, concluir, atualizar, voltar, irPara],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useInscricao(): ContextoInscricao {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useInscricao fora do InscricaoProvider");
  return ctx;
}
