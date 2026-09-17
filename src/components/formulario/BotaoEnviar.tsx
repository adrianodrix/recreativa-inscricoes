"use client";

import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

interface Props {
  children: ReactNode;
  variante?: "primary" | "secondary";
  bloco?: boolean;
}

/* Botão de envio que mostra estado ocupado enquanto a Server Action roda. */
export function BotaoEnviar({ children, variante = "primary", bloco }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`rc-btn rc-btn--${variante} ${bloco ? "rc-btn--block" : ""}`}
      aria-busy={pending || undefined}
      disabled={pending}
    >
      {pending && <LoaderCircle className="rc-icon" aria-hidden="true" />}
      {children}
    </button>
  );
}
