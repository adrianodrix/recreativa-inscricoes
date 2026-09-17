import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { listarBrincadeiras } from "@/lib/brincadeiras/consultas";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterItemProgramacao } from "@/lib/pagina-inicial/consultas";
import { excluirItemProgramacao } from "../actions";
import { FormularioItem } from "../FormularioItem";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; pid: string }>;
}

export const metadata = { title: "Editar momento" };

export default async function PaginaEditarItem({ params }: Props) {
  const [{ id, pid }, usuario] = await Promise.all([params, exigirLogin()]);
  const [evento, item, brincadeiras] = await Promise.all([obterEvento(id), obterItemProgramacao(id, pid), listarBrincadeiras(id)]);
  if (!evento || !item) notFound();
  const podeEditar = pode(usuario.perfil, "editar_pagina_inicial");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Programação", href: `/painel/eventos/${id}/programacao` }]} />
          <h1>{item.titulo}</h1>
        </div>
        {podeEditar && (
          <FormularioConfirmar acao={excluirItemProgramacao.bind(null, id, pid)} mensagem={`Excluir "${item.titulo}" da programação?`}>
            <button type="submit" className="rc-btn rc-btn--sm">
              <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
            </button>
          </FormularioConfirmar>
        )}
      </div>
      {podeEditar ? (
        <FormularioItem eventoId={id} item={item} brincadeiras={brincadeiras} />
      ) : (
        <p className="rc-hint">Seu perfil só permite visualizar.</p>
      )}
    </>
  );
}
