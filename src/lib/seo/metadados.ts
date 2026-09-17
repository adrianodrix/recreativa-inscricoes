import "server-only";
import type { Metadata } from "next";
import { env } from "@/lib/env";

/* Base absoluta das URLs de metadata (canonical, og:url, og:image). */
export function urlDoSite(): URL {
  return new URL(env().APP_URL);
}

export function urlAbsoluta(caminho: string): string {
  return new URL(caminho, urlDoSite()).toString();
}

interface Entrada {
  titulo: string;
  descricao: string;
  /* Caminho da própria página, para canonical e og:url. */
  caminho: string;
  /* Capa do evento. Sem ela, vale a imagem gerada por opengraph-image.tsx. */
  imagem?: string | null;
  /* Páginas de uso pessoal (confirmação) ficam fora dos buscadores. */
  indexar?: boolean;
}

/*
 * Metadados de uma página pública: título, descrição, canonical, Open Graph
 * (WhatsApp, Facebook) e Twitter card. O restante (site_name, idioma, base)
 * vem do layout raiz.
 */
export function metadadosPagina({ titulo, descricao, caminho, imagem, indexar = true }: Entrada): Metadata {
  /* A chave `images` só entra quando há capa: declará-la vazia cancelaria a
     imagem gerada por opengraph-image.tsx. */
  const imagens = imagem ? { images: [{ url: imagem, width: 1200, height: 630, alt: titulo }] } : {};
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: caminho },
    robots: indexar ? undefined : { index: false, follow: false },
    /* O openGraph da página substitui o do layout: repetir site_name e idioma. */
    openGraph: {
      title: titulo,
      description: descricao,
      url: caminho,
      type: "website",
      siteName: "Recreativa",
      locale: "pt_BR",
      ...imagens,
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      ...imagens,
    },
  };
}
