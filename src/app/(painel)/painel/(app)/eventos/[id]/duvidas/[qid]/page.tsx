import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterPergunta } from "@/lib/pagina-inicial/consultas";
import { excluirPergunta } from "../actions";
import { FormularioPergunta } from "../FormularioPergunta";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; qid: string }>;
}

export const metadata = { title: "Editar dúvida" };

export default async function PaginaEditarDuvida({ params }: Props) {
  const [{ id, qid }, usuario] = await Promise.all([params, exigirLogin()]);
  const [evento, pergunta] = await Promise.all([obterEvento(id), obterPergunta(id, qid)]);
  if (!evento || !pergunta) notFound();
  const podeEditar = pode(usuario.perfil, "editar_pagina_inicial");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Dúvidas", href: `/painel/eventos/${id}/duvidas` }]} />
          <h1>Editar dúvida</h1>
        </div>
        {podeEditar && (
          <FormularioConfirmar acao={excluirPergunta.bind(null, id, qid)} mensagem={`Excluir a dúvida "${pergunta.pergunta}"?`}>
            <button type="submit" className="rc-btn rc-btn--sm">
              <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
            </button>
          </FormularioConfirmar>
        )}
      </div>
      {podeEditar ? <FormularioPergunta eventoId={id} pergunta={pergunta} /> : <p className="rc-hint">Seu perfil só permite visualizar.</p>}
    </>
  );
}
