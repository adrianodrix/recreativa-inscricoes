import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./TituloCartao.module.css";

interface Props {
  icone: LucideIcon;
  children: ReactNode;
  /* Link para a tela completa do que o cartão resume. */
  acao?: { href: string; rotulo: string };
}

/* Título de cartão do painel com um ícone de identificação, sempre no mesmo tom para servir de baliza, não de destaque. */
export function TituloCartao({ icone: Icone, children, acao }: Props) {
  return (
    <div className={styles.linha}>
      <h3 className={`rc-card__title ${styles.titulo}`}>
        <span className={styles.icone} aria-hidden="true">
          <Icone />
        </span>
        {children}
      </h3>
      {acao && (
        <Link href={acao.href} className="rc-btn rc-btn--sm">
          {acao.rotulo} <ArrowRight className="rc-icon" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
