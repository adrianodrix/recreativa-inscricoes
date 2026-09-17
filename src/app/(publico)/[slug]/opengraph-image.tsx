import { formatarDataLonga, formatarHora } from "@/lib/datas";
import { obterEventoPublico } from "@/lib/inscricao/publico";
import { imagemOg, TAMANHO_OG, TIPO_OG } from "@/lib/seo/imagem-og";

export const alt = "Inscrição da Recreativa";
export const size = TAMANHO_OG;
export const contentType = TIPO_OG;

/* Prévia do link da inscrição de um evento. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await obterEventoPublico(slug);
  if (!evento) return imagemOg({ titulo: "Recreativa", rodape: "Evento não encontrado" });

  return imagemOg({
    titulo: evento.nome,
    chamada: evento.subtitulo ?? "Inscrições abertas",
    rodape: `${formatarDataLonga(evento.data_evento)} · ${formatarHora(evento.hora_inicio)} às ${formatarHora(evento.hora_fim)} · ${evento.endereco}`,
  });
}
