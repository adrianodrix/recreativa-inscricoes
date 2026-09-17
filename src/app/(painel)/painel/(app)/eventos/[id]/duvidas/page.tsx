import { Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { ListaOrdenavel } from "@/components/painel/ListaOrdenavel";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { listarPerguntas } from "@/lib/pagina-inicial/consultas";
import { textoPlano } from "@/lib/texto-rico/schema";
import { reordenarPerguntas } from "./actions";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "Dúvidas" };

export default async function PaginaDuvidas({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const perguntas = await listarPerguntas(id);
  const podeEditar = pode(usuario.perfil, "editar_pagina_inicial");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={trilhaEvento(id, evento.nome)} />
          <h1>Dúvidas</h1>
          <p className="rc-hint">Perguntas frequentes da página inicial.</p>
        </div>
        {podeEditar && (
          <Link href={`/painel/eventos/${id}/duvidas/nova`} className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Nova dúvida
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Dúvida salva.</Alerta>}
      {perguntas.length === 0 ? (
        <p className={styles.vazio}>Nenhuma dúvida cadastrada. Sem elas, a página inicial não mostra a seção.</p>
      ) : (
        <>
          {podeEditar && perguntas.length > 1 && <p className="rc-hint">Esta é a ordem na página. Arraste pela alça para mudar.</p>}
          <ListaOrdenavel
            key={perguntas.map((q) => q.id).join("|")}
            id="lista-duvidas"
            podeReordenar={podeEditar}
            aoReordenar={reordenarPerguntas.bind(null, id)}
            itens={perguntas.map((q) => ({
              id: q.id,
              rotulo: q.pergunta,
              conteudo: (
                <Link href={`/painel/eventos/${id}/duvidas/${q.id}`} className="rc-card rc-card--interactive">
                  <header className="rc-card__header">
                    <h2 className="rc-card__title">{q.pergunta}</h2>
                  </header>
                  <p className="rc-hint">{textoPlano(q.resposta).slice(0, 140)}</p>
                </Link>
              ),
            }))}
          />
        </>
      )}
    </>
  );
}
