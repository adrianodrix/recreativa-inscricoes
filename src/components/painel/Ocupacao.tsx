import styles from "./indicadores.module.css";

export type NivelOcupacao = "normal" | "ok" | "atencao" | "critico";

interface Props {
  total: number;
  limite: number;
  /* O que está sendo contado: "inscritos", "pessoas", "casais", "duplas"… */
  rotulo?: string;
  /* Quando quem chama sabe melhor o que a proporção significa (ex.: equilíbrio entre times). */
  nivel?: NivelOcupacao;
  legenda?: string;
}

/* Total contra um limite: número grande, barra proporcional e vagas livres. */
export function Ocupacao({ total, limite, rotulo = "inscritos", nivel: nivelDado, legenda: legendaDada }: Props) {
  const fracao = limite > 0 ? Math.min(total / limite, 1) : total > 0 ? 1 : 0;
  const livres = limite - total;
  const nivel = nivelDado ?? (livres <= 0 ? "critico" : fracao >= 0.9 ? "atencao" : "normal");
  const legenda = legendaDada ?? (livres > 0 ? `${livres} ${livres === 1 ? "vaga livre" : "vagas livres"}` : livres === 0 ? "Lotado" : `${-livres} acima do limite`);
  return (
    <div className={styles.indicador} data-nivel={nivel}>
      <span className={styles.rotulo}>{rotulo}</span>
      <p className={styles.numero}>
        <strong>{total}</strong> <span>de {limite}</span>
      </p>
      <div className={styles.barra} role="meter" aria-label="Vagas ocupadas" aria-valuemin={0} aria-valuemax={limite} aria-valuenow={Math.min(total, limite)}>
        <span style={{ width: `${fracao * 100}%` }} />
      </div>
      <span className={styles.legenda}>{legenda}</span>
    </div>
  );
}
