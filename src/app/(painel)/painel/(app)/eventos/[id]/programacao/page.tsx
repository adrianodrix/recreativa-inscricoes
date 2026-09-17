import { Plus, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { listarProgramacao } from "@/lib/pagina-inicial/consultas";
import { faixaHorario } from "@/lib/pagina-inicial/programacao";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "Programação" };

export default async function PaginaProgramacao({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const itens = await listarProgramacao(id);
  const podeEditar = pode(usuario.perfil, "editar_pagina_inicial");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={trilhaEvento(id, evento.nome)} />
          <h1>Programação</h1>
          <p className="rc-hint">Os momentos do dia, na página inicial. A ordem vem do horário.</p>
        </div>
        {podeEditar && (
          <Link href={`/painel/eventos/${id}/programacao/nova`} className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Novo momento
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Programação salva.</Alerta>}
      {itens.length === 0 ? (
        <p className={styles.vazio}>Nenhum momento cadastrado. Sem programação, a página inicial não mostra o cronograma do dia.</p>
      ) : (
        <ul className={styles.lista}>
          {itens.map((item) => (
            <li key={item.id}>
              <Link href={`/painel/eventos/${id}/programacao/${item.id}`} className="rc-card rc-card--interactive">
                <header className="rc-card__header">
                  <h2 className="rc-card__title">{item.titulo}</h2>
                  {item.destaque && (
                    <span className="rc-badge rc-badge--roxo">
                      <Star className="rc-icon rc-icon--sm" aria-hidden="true" /> No resumo
                    </span>
                  )}
                </header>
                <ul className="rc-card__meta">
                  <li>{faixaHorario(item.hora_inicio, item.hora_fim)}</li>
                  {item.detalhe && <li>{item.detalhe}</li>}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
