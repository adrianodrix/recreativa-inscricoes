"use client";

import { useEffect, useState } from "react";
import { consultarNome } from "@/app/(publico)/[slug]/actions";
import type { SituacaoNome } from "../modelo/dependentes";
import { useInscricao } from "./InscricaoProvider";

/*
 * Consulta se um nome já tem inscrição no evento. Também cobre a recusa final:
 * se a criar_inscricao devolveu "nome_duplicado" para esta etapa, descobre se foi
 * a própria pessoa ou um familiar e troca a mensagem de erro pelo aviso com saída.
 */
export function useNomeInscrito(nomeSalvo: string) {
  const { evento, etapaAtual, estado, dispatch } = useInscricao();
  const [situacao, setSituacao] = useState<SituacaoNome>("livre");
  const [verificando, setVerificando] = useState(false);
  const recusado = estado.errosServidor[etapaAtual.id]?.codigo === "nome_duplicado";

  useEffect(() => {
    if (!recusado || !nomeSalvo) return;
    let ativo = true;
    consultarNome(evento.id, nomeSalvo).then((s) => {
      if (!ativo || s === "livre") return;
      setSituacao(s);
      dispatch({ tipo: "LIMPAR_ERRO", etapaId: etapaAtual.id });
    });
    return () => {
      ativo = false;
    };
  }, [recusado, nomeSalvo, evento.id, etapaAtual.id, dispatch]);

  async function verificar(nome: string): Promise<SituacaoNome> {
    setVerificando(true);
    try {
      const s = await consultarNome(evento.id, nome);
      setSituacao(s);
      return s;
    } finally {
      setVerificando(false);
    }
  }

  return { situacao, verificando, verificar, limpar: () => setSituacao("livre") };
}
