import styles from "./Ocupacao.module.css";

interface Props {
  total: number;
  limite: number;
}

/* Inscritos contra o limite do evento: número grande, barra proporcional e vagas livres. */
export function Ocupacao({ total, limite }: Props) {
  const fracao = limite > 0 ? Math.min(total / limite, 1) : 1;
  const livres = limite - total;
  const nivel = livres <= 0 ? "lotado" : fracao >= 0.9 ? "quase" : "normal";
  const legenda = livres > 0 ? `${livres} ${livres === 1 ? "vaga livre" : "vagas livres"}` : livres === 0 ? "Lotado" : `${-livres} acima do limite`;
  return (
    <div className={styles.ocupacao} data-nivel={nivel}>
      <span className={styles.ocupacaoRotulo}>Inscritos</span>
      <p className={styles.ocupacaoNumero}>
        <strong>{total}</strong> <span>de {limite}</span>
      </p>
      <div className={styles.ocupacaoBarra} role="meter" aria-label="Vagas ocupadas" aria-valuemin={0} aria-valuemax={limite} aria-valuenow={Math.min(total, limite)}>
        <span style={{ width: `${fracao * 100}%` }} />
      </div>
      <span className={styles.ocupacaoLegenda}>{legenda}</span>
    </div>
  );
}
