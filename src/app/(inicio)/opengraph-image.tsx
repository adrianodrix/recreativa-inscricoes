import { carregarPaginaInicial } from "@/features/pagina-inicial/carregar";
import { formatarDataLonga, formatarHora } from "@/lib/datas";
import { imagemOg, TAMANHO_OG, TIPO_OG } from "@/lib/seo/imagem-og";

export const alt = "Recreativa";
export const size = TAMANHO_OG;
export const contentType = TIPO_OG;

/* Prévia do link da página inicial: o evento em destaque. */
export default async function Image() {
  const dados = await carregarPaginaInicial();
  if (!dados) return imagemOg({ titulo: "Recreativa", rodape: "Inscrições pelo link dos organizadores" });

  const { evento } = dados;
  return imagemOg({
    titulo: evento.nome,
    chamada: evento.subtitulo,
    rodape: `${formatarDataLonga(evento.data_evento)} · ${formatarHora(evento.hora_inicio)} às ${formatarHora(evento.hora_fim)} · ${evento.endereco}`,
  });
}
