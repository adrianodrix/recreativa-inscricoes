import styles from "./indicadores.module.css";

interface Props {
  valor: number;
  rotulo: string;
  descricao?: string;
}

/* Contagem sem limite: número grande com rótulo, no mesmo desenho da ocupação. */
export function Contador({ valor, rotulo, descricao }: Props) {
  return (
    <div className={styles.indicador}>
      <span className={styles.rotulo}>{rotulo}</span>
      <p className={styles.numero}>
        <strong>{valor}</strong>
      </p>
      {descricao && <span className={styles.legenda}>{descricao}</span>}
    </div>
  );
}
