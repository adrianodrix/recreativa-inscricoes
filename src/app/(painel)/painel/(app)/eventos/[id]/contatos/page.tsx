import { Phone, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { ListaOrdenavel } from "@/components/painel/ListaOrdenavel";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { listarContatos } from "@/lib/pagina-inicial/consultas";
import { formatarWhatsapp } from "@/lib/pessoas/whatsapp";
import { reordenarContatos } from "./actions";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "Contatos" };

export default async function PaginaContatos({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const contatos = await listarContatos(id);
  const podeEditar = pode(usuario.perfil, "editar_pagina_inicial");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={trilhaEvento(id, evento.nome)} />
          <h1>Contatos</h1>
          <p className="rc-hint">Quem as famílias procuram, no rodapé da página inicial.</p>
        </div>
        {podeEditar && (
          <Link href={`/painel/eventos/${id}/contatos/novo`} className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Novo contato
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Contato salvo.</Alerta>}
      {contatos.length === 0 ? (
        <p className={styles.vazio}>Nenhum contato cadastrado. Sem eles, a página inicial não mostra a seção “fale com a gente”.</p>
      ) : (
        <>
          {podeEditar && contatos.length > 1 && <p className="rc-hint">Esta é a ordem na página. Arraste pela alça para mudar.</p>}
          <ListaOrdenavel
            key={contatos.map((c) => c.id).join("|")}
            id="lista-contatos"
            podeReordenar={podeEditar}
            aoReordenar={reordenarContatos.bind(null, id)}
            itens={contatos.map((c) => ({
              id: c.id,
              rotulo: c.nome,
              conteudo: (
                <Link href={`/painel/eventos/${id}/contatos/${c.id}`} className="rc-card rc-card--interactive">
                  <header className="rc-card__header">
                    <h2 className="rc-card__title">{c.nome}</h2>
                  </header>
                  <ul className="rc-card__meta">
                    <li>
                      <Phone className="rc-icon" aria-hidden="true" />
                      {formatarWhatsapp(c.whatsapp)}
                    </li>
                  </ul>
                </Link>
              ),
            }))}
          />
        </>
      )}
    </>
  );
}
