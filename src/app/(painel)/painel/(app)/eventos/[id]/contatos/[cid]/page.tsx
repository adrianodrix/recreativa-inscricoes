import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterContato } from "@/lib/pagina-inicial/consultas";
import { excluirContato } from "../actions";
import { FormularioContato } from "../FormularioContato";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; cid: string }>;
}

export const metadata = { title: "Editar contato" };

export default async function PaginaEditarContato({ params }: Props) {
  const [{ id, cid }, usuario] = await Promise.all([params, exigirLogin()]);
  const [evento, contato] = await Promise.all([obterEvento(id), obterContato(id, cid)]);
  if (!evento || !contato) notFound();
  const podeEditar = pode(usuario.perfil, "editar_pagina_inicial");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Contatos", href: `/painel/eventos/${id}/contatos` }]} />
          <h1>{contato.nome}</h1>
        </div>
        {podeEditar && (
          <FormularioConfirmar acao={excluirContato.bind(null, id, cid)} mensagem={`Excluir o contato de ${contato.nome}?`}>
            <button type="submit" className="rc-btn rc-btn--sm">
              <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
            </button>
          </FormularioConfirmar>
        )}
      </div>
      {podeEditar ? <FormularioContato eventoId={id} contato={contato} /> : <p className="rc-hint">Seu perfil só permite visualizar.</p>}
    </>
  );
}
