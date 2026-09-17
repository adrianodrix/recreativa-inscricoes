import { Logo } from "@/components/marca/Logo";
import styles from "./page.module.css";

export default function PaginaInicial() {
  return (
    <main className={`rc-surface-brand rc-surface-brand--degrade ${styles.capa}`}>
      <Logo variante="laranja" largura={320} prioridade className={styles.logo} />
      <p className={styles.texto}>As inscrições são feitas pelo link enviado pelos organizadores.</p>
    </main>
  );
}
