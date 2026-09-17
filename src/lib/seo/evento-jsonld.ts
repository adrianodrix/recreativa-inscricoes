/*
 * Dados estruturados do evento (schema.org/Event). É o que faz o link render
 * bem em buscadores e em alguns apps de mensagem. Puro: entra evento, sai JSON.
 */
import { formatarHora } from "@/lib/datas";

export interface EventoParaSeo {
  nome: string;
  descricao: string | null;
  data_evento: string;
  hora_inicio: string;
  hora_fim: string;
  endereco: string;
  link_maps: string;
  valor_inscricao: number;
  /* Nulo = inscrições abertas. */
  motivo_fechado: string | null;
  /* O formulário público não carrega o período; a página inicial carrega. */
  inscricoes_inicio?: string;
  inscricoes_fim?: string;
}

/* "2027-02-21" + "13:00:00" → "2027-02-21T13:00:00-03:00" (fuso do evento). */
function instante(data: string, hora: string): string {
  return `${data}T${formatarHora(hora)}:00-03:00`;
}

export function jsonLdEvento(e: EventoParaSeo, opcoes: { url: string; imagem: string | null }): Record<string, unknown> {
  const abertas = e.motivo_fechado === null;
  const gratuito = e.valor_inscricao === 0;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.nome,
    ...(e.descricao ? { description: e.descricao } : {}),
    startDate: instante(e.data_evento, e.hora_inicio),
    endDate: instante(e.data_evento, e.hora_fim),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: opcoes.url,
    ...(opcoes.imagem ? { image: [opcoes.imagem] } : {}),
    location: {
      "@type": "Place",
      name: e.endereco,
      address: e.endereco,
      hasMap: e.link_maps,
    },
    organizer: { "@type": "Organization", name: "Recreativa" },
    isAccessibleForFree: gratuito,
    offers: {
      "@type": "Offer",
      url: opcoes.url,
      price: e.valor_inscricao,
      priceCurrency: "BRL",
      availability: abertas ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      ...(e.inscricoes_inicio ? { validFrom: e.inscricoes_inicio } : {}),
      ...(e.inscricoes_fim ? { validThrough: e.inscricoes_fim } : {}),
    },
  };
}
