import { exigirPerfil } from "@/lib/auth/perfil";
import { FormularioEvento } from "../FormularioEvento";
import styles from "../../painel.module.css";
import { Trilha, trilhaEventos } from "@/components/painel/Trilha";

export const metadata = { title: "Novo evento" };

export default async function PaginaNovoEvento() {
  await exigirPerfil("editar_evento");
  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[trilhaEventos]} />
          <h1>Novo evento</h1>
        </div>
      </div>
      <FormularioEvento evento={null} />
    </>
  );
}
