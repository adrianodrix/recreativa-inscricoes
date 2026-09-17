import { exigirPerfil } from "@/lib/auth/perfil";
import { FormularioEvento } from "../FormularioEvento";
import styles from "../../painel.module.css";

export const metadata = { title: "Novo evento" };

export default async function PaginaNovoEvento() {
  await exigirPerfil("editar_evento");
  return (
    <>
      <div className={styles.titulo}>
        <h1>Novo evento</h1>
      </div>
      <FormularioEvento evento={null} />
    </>
  );
}
