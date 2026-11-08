"use client";

import { useState } from "react";

/* Estado comum dos campos de upload: enviando, progresso (0 a 1) e erro. */
export function useEnvio(valorInicial: string | null | undefined) {
  const [path, setPath] = useState(valorInicial ?? "");
  const [progresso, setProgresso] = useState<number | null>(null);
  const [erro, setErro] = useState<string>();

  /* Roda o envio; se der certo, o caminho novo vai para o campo oculto do formulário. */
  async function enviar(executar: (aoProgredir: (f: number) => void) => Promise<string>, falha: string) {
    setErro(undefined);
    setProgresso(0);
    try {
      setPath(await executar(setProgresso));
    } catch (e) {
      setErro(e instanceof Error ? `Não foi possível enviar: ${e.message}` : falha);
    } finally {
      setProgresso(null);
    }
  }

  return { path, setPath, enviando: progresso !== null, progresso, erro, setErro, enviar };
}
