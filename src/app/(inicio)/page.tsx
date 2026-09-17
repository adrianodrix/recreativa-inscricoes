import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { Logo } from "@/components/marca/Logo";
import { carregarPaginaInicial } from "@/features/pagina-inicial/carregar";
import { PaginaInicial } from "@/features/pagina-inicial/PaginaInicial";
import { jsonLdEvento } from "@/lib/seo/evento-jsonld";
import { metadadosPagina, urlAbsoluta } from "@/lib/seo/metadados";
import { urlImagem } from "@/lib/storage/url";
import styles from "./page.module.css";

/* Números e situação das inscrições mudam a cada visita (P5). */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const dados = await carregarPaginaInicial();
  if (!dados) return { alternates: { canonical: "/" } };
  const { evento } = dados;
  const meta = metadadosPagina({
    titulo: evento.nome,
    descricao: evento.descricao ?? `Inscrições da ${evento.nome}.`,
    caminho: "/",
    imagem: urlImagem(evento.capa_path),
  });
  return { ...meta, title: { absolute: `${evento.nome} · Recreativa` } };
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
  return (
    <>
      <JsonLd dados={jsonLdEvento(dados.evento, { url: urlAbsoluta("/"), imagem: urlImagem(dados.evento.capa_path) })} />
      <PaginaInicial dados={dados} />
    </>
  );
}
