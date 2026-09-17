import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioEvento } from "../../FormularioEvento";
import styles from "../../../painel.module.css";

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
          <p className="rc-hint">
            <Link href={`/painel/eventos/${id}`} className="rc-link">{evento.nome}</Link>
          </p>
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
