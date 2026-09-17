import { CalendarDays, ExternalLink, Globe, MessageCircleQuestion, Phone } from "lucide-react";
import Link from "next/link";
import { TituloCartao } from "@/components/painel/TituloCartao";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import type { ResumoPaginaInicial } from "@/lib/pagina-inicial/consultas";
import { alternarPublicacao } from "../actions";
import styles from "../../painel.module.css";

interface Props {
  eventoId: string;
  slug: string;
  perfil: Perfil;
  publicado: boolean;
  /* Verdadeiro quando é este o evento que a "/" mostra hoje. */
  emDestaque: boolean;
  resumo: ResumoPaginaInicial;
}

const LISTAS = [
  { chave: "programacao", rota: "programacao", rotulo: "Programação", icone: CalendarDays },
  { chave: "perguntas", rota: "duvidas", rotulo: "Dúvidas", icone: MessageCircleQuestion },
  { chave: "contatos", rota: "contatos", rotulo: "Contatos", icone: Phone },
] as const;

/* Página inicial do evento (P5–P11): o que já está preenchido e a chave de publicação. */
export function CartaoPaginaInicial({ eventoId, slug, perfil, publicado, emDestaque, resumo }: Props) {
  const alternar = alternarPublicacao.bind(null, eventoId, !publicado);
  return (
    <article className={`rc-card ${styles.cartao}`}>
      <header className="rc-card__header">
        <TituloCartao icone={Globe}>Página inicial</TituloCartao>
        {publicado ? (
          <span className="rc-badge rc-badge--success">{emDestaque ? "No ar em /" : "Publicado"}</span>
        ) : (
          <span className="rc-badge rc-badge--warning">Em preparação</span>
        )}
      </header>

      <ul className={`rc-card__meta ${styles.resumoLista}`}>
        {LISTAS.map(({ chave, rota, rotulo, icone: Icone }) => (
          <li key={chave}>
            <Icone className="rc-icon" aria-hidden="true" />
            <Link href={`/painel/eventos/${eventoId}/${rota}`} className="rc-link">
              {rotulo}
            </Link>
            : {resumo[chave]} {resumo[chave] === 1 ? "item" : "itens"}
          </li>
        ))}
      </ul>

      <footer className="rc-card__footer">
        {publicado ? (
          <a href={`/${slug}`} target="_blank" rel="noreferrer" className="rc-btn rc-btn--sm">
            <ExternalLink className="rc-icon" aria-hidden="true" /> Ver /{slug}
          </a>
        ) : (
          <span className={styles.statusLinha}>Enquanto está em preparação, a página e a inscrição ficam fora do ar.</span>
        )}
        {pode(perfil, "editar_pagina_inicial") && (
          <form action={alternar}>
            <button type="submit" className={`rc-btn rc-btn--sm ${publicado ? "" : "rc-btn--primary"}`}>
              {publicado ? "Despublicar" : "Publicar"}
            </button>
          </form>
        )}
      </footer>
    </article>
  );
}
