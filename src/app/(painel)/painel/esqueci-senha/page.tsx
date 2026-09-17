import Image from "next/image";
import { FormularioEsqueci } from "./FormularioEsqueci";
import styles from "../auth.module.css";

export const metadata = { title: "Esqueci minha senha" };

export default function PaginaEsqueciSenha() {
  return (
    <main className={styles.pagina}>
      <div className={styles.cartao}>
        <Image src="/marca/logo-recreativa-roxo.svg" alt="Recreativa" width={192} height={114} className={styles.logo} priority />
        <h1 className={styles.titulo}>Definir nova senha</h1>
        <FormularioEsqueci />
      </div>
    </main>
  );
}
