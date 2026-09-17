"use client";

import type { ReactNode } from "react";

interface Props {
  acao: () => Promise<void>;
  mensagem: string;
  children: ReactNode;
  className?: string;
}

/* Formulário de ação destrutiva que pede confirmação antes de enviar. */
export function FormularioConfirmar({ acao, mensagem, children, className }: Props) {
  return (
    <form
      action={acao}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(mensagem)) e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
