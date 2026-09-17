import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./TituloCartao.module.css";

interface Props {
  icone: LucideIcon;
  children: ReactNode;
}

/* Título de cartão do painel com um ícone de identificação, sempre no mesmo tom para servir de baliza, não de destaque. */
export function TituloCartao({ icone: Icone, children }: Props) {
  return (
    <h3 className={`rc-card__title ${styles.titulo}`}>
      <span className={styles.icone} aria-hidden="true">
        <Icone />
      </span>
      {children}
    </h3>
  );
}
