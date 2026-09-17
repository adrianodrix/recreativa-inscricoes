import { notFound } from "next/navigation";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioEvento } from "../../FormularioEvento";
import styles from "../../../painel.module.css";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Editar evento" };

export default async function PaginaEditarEvento({ params }: Props) {
  const [{ id }, usuario] = await Promise.all([params, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={trilhaEvento(id, evento.nome)} />
          <h1>Editar evento</h1>
        </div>
      </div>
      {pode(usuario.perfil, "editar_evento") ? (
        <FormularioEvento evento={evento} />
      ) : (
        <p className="rc-hint">Seu perfil só permite visualizar este evento.</p>
      )}
    </>
  );
}
