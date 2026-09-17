import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterBrincadeira } from "@/lib/brincadeiras/consultas";
import { obterEvento } from "@/lib/eventos/consultas";
import { excluirBrincadeira } from "../actions";
import { FormularioBrincadeira } from "../FormularioBrincadeira";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; bid: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id, bid } = await params;
  const b = await obterBrincadeira(id, bid);
  return { title: b?.nome ?? "Brincadeira" };
}

export default async function PaginaBrincadeira({ params }: Props) {
  const [{ id, bid }, usuario] = await Promise.all([params, exigirLogin()]);
  const [evento, brincadeira] = await Promise.all([obterEvento(id), obterBrincadeira(id, bid)]);
  if (!evento || !brincadeira) notFound();
  const podeEditar = pode(usuario.perfil, "editar_brincadeira");
  const excluir = excluirBrincadeira.bind(null, id, bid);

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <p className="rc-hint">{evento.nome}</p>
          <h1>{brincadeira.nome}</h1>
        </div>
        {podeEditar && brincadeira.vagas_ocupadas === 0 && (
          <form action={excluir}>
            <button type="submit" className="rc-btn rc-btn--sm">
              <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
            </button>
          </form>
        )}
      </div>
      {podeEditar ? <FormularioBrincadeira eventoId={id} brincadeira={brincadeira} /> : <p className="rc-hint">Seu perfil só permite visualizar.</p>}
    </>
  );
}
