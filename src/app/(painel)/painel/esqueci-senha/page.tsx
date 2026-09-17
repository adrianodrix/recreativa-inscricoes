import { Logo } from "@/components/marca/Logo";
import { FormularioEsqueci } from "./FormularioEsqueci";
import styles from "../auth.module.css";

export const metadata = { title: "Esqueci minha senha" };

export default function PaginaEsqueciSenha() {
  return (
    <main className={styles.pagina}>
      <div className={styles.cartao}>
        <Logo largura={192} prioridade className={styles.logo} />
        <h1 className={styles.titulo}>Definir nova senha</h1>
        <FormularioEsqueci />
      </div>
    </main>
  );
}
