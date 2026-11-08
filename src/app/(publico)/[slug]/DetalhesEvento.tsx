import { Calendar, ExternalLink, MapPin } from "lucide-react";
import type { EventoPublico } from "@/features/inscricao/modelo/tipos";
import { formatarDataExtenso, formatarHora, formatarValor } from "@/lib/datas";
import { RichText } from "@/lib/texto-rico/RichText";

/* Data, local, valor e recomendações do evento: fecham as páginas de confirmação. */
export function DetalhesEvento({ evento }: { evento: EventoPublico }) {
  return (
    <>
      <ul className="rc-card__meta">
        <li>
          <Calendar className="rc-icon" aria-hidden="true" />
          {formatarDataExtenso(evento.data_evento)}, {formatarHora(evento.hora_inicio)} às {formatarHora(evento.hora_fim)}
        </li>
        <li>
          <MapPin className="rc-icon" aria-hidden="true" />
          {evento.endereco}{" "}
          <a href={evento.link_maps} target="_blank" rel="noreferrer" className="rc-link">
            ver no mapa <ExternalLink className="rc-icon rc-icon--sm" aria-hidden="true" />
          </a>
        </li>
        {evento.valor_inscricao > 0 && <li>Valor da inscrição: {formatarValor(evento.valor_inscricao)}</li>}
      </ul>
      {evento.recomendacoes && (
        <section className="rc-card">
          <header className="rc-card__header">
            <h2 className="rc-card__title">Recomendações importantes</h2>
          </header>
          <RichText doc={evento.recomendacoes} />
        </section>
      )}
    </>
  );
}
