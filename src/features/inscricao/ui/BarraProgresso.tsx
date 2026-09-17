import styles from "./formulario.module.css";

export function BarraProgresso({ atual, total }: { atual: number; total: number }) {
  const pct = Math.round((atual / Math.max(total, 1)) * 100);
  return (
    <div className={styles.progresso} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progresso da inscrição">
      <div className={styles.progressoBarra} style={{ width: `${pct}%` }} />
    </div>
  );
}
