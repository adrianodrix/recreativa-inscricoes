import Image from "next/image";
import styles from "./page.module.css";

export default function PaginaInicial() {
  return (
    <main className={`rc-surface-brand ${styles.capa}`}>
      <Image
        src="/marca/logo-recreativa.svg"
        alt="Recreativa"
        width={320}
        height={190}
        priority
        className={styles.logo}
      />
      <p className={styles.texto}>As inscrições são feitas pelo link enviado pelos organizadores.</p>
    </main>
  );
}
