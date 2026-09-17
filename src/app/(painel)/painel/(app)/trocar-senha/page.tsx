import { FormularioSenha } from "@/components/formulario/FormularioSenha";
import { redefinirSenha } from "../../auth/actions";
import styles from "../../auth.module.css";

export const metadata = { title: "Trocar senha" };

export default function PaginaTrocarSenha() {
  return (
    <div className={styles.cartao}>
      <h1 className={styles.titulo}>Trocar senha</h1>
      <FormularioSenha acao={redefinirSenha} className={styles.formulario} />
    </div>
  );
}
