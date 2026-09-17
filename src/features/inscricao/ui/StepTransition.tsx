"use client";

import { ViewTransition, type ReactNode } from "react";

/*
 * Deslize + fade entre perguntas usando a View Transitions API do React 19.3
 * (0 kB de JS). Navegadores sem suporte trocam a tela na hora. As classes
 * estão em src/styles/transicoes.css (globais, para o pseudo-elemento).
 */
export function StepTransition({ etapaId, children }: { etapaId: string; children: ReactNode }) {
  return (
    <ViewTransition
      key={etapaId}
      enter={{ avancar: "etapa-entra-dir", voltar: "etapa-entra-esq", default: "none" }}
      exit={{ avancar: "etapa-sai-esq", voltar: "etapa-sai-dir", default: "none" }}
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
