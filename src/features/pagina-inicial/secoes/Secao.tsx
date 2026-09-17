import type { ReactNode } from "react";
import styles from "../pagina-inicial.module.css";

interface Props {
  id: string;
  titulo: string;
  children: ReactNode;
}

/* Bloco da página inicial: mesma largura, mesmo respiro e a âncora do menu. */
export function Secao({ id, titulo, children }: Props) {
  return (
    <section id={id} className={styles.secao} aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className={styles.tituloSecao}>
        {titulo}
      </h2>
      {children}
    </section>
  );
}
