import type { ReactNode } from "react";

/* O painel inteiro fica fora dos buscadores, inclusive a tela de login. */
export const metadata = { robots: { index: false, follow: false } };

export default function LayoutPainel({ children }: { children: ReactNode }) {
  return children;
}
