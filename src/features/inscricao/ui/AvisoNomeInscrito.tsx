import { Info } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./formulario.module.css";

interface Props {
  titulo: string;
  children: ReactNode;
  /* Botões com as saídas possíveis (sair, corrigir, seguir sem cadastrar…). */
  acoes: ReactNode;
}

/* Nome que já tem inscrição no evento: explica e oferece saída, em vez de só barrar. */
export function AvisoNomeInscrito({ titulo, children, acoes }: Props) {
  return (
    <div className={`campo-anima ${styles.aviso}`}>
      <div className="rc-alert" role="status">
        <Info className="rc-icon" aria-hidden="true" />
        <div>
          <strong className="rc-alert__title">{titulo}</strong>
          {children}
        </div>
      </div>
      <div className={styles.avisoAcoes}>{acoes}</div>
    </div>
  );
}
