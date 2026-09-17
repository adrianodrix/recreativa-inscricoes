import type { Metadata } from "next";
import { Logo } from "@/components/marca/Logo";
import { carregarPaginaInicial } from "@/features/pagina-inicial/carregar";
import { PaginaInicial } from "@/features/pagina-inicial/PaginaInicial";
import { urlImagem } from "@/lib/storage/url";
import styles from "./page.module.css";

/* Números e situação das inscrições mudam a cada visita (P5). */
export const dynamic = "force-dynamic";

const OG_PADRAO = "/marca/og-recreativa.png";

export async function generateMetadata(): Promise<Metadata> {
  const dados = await carregarPaginaInicial();
  if (!dados) return {};
  const { evento } = dados;
  const descricao = evento.descricao ?? `Inscrições da ${evento.nome}.`;
  return {
    title: { absolute: `${evento.nome} · Recreativa` },
    description: descricao,
    openGraph: {
      title: evento.nome,
      description: descricao,
      type: "website",
      images: [urlImagem(evento.capa_path) ?? OG_PADRAO],
    },
  };
}

/* Página do evento em destaque; sem nenhum publicado, mantém a capa da marca. */
export default async function PaginaRaiz() {
  const dados = await carregarPaginaInicial();
  if (!dados) {
    return (
      <main className={`rc-surface-brand rc-surface-brand--degrade ${styles.capa}`}>
        <Logo variante="laranja" largura={320} prioridade className={styles.logo} />
        <p className={styles.texto}>As inscrições são feitas pelo link enviado pelos organizadores.</p>
      </main>
    );
  }
  return <PaginaInicial dados={dados} />;
}
