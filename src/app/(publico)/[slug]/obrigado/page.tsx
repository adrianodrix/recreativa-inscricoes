import { Calendar, CircleCheck, ExternalLink, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/marca/Logo";
import { formatarDataExtenso, formatarHora, formatarValor } from "@/lib/datas";
import { obterEventoPublico } from "@/lib/inscricao/publico";
import { RichText } from "@/lib/texto-rico/RichText";
import { LimparRascunho } from "./LimparRascunho";
import styles from "../publico.module.css";

export const dynamic = "force-dynamic";

/* Página pessoal de quem acabou de se inscrever: não vai para buscadores. */
export const metadata = { title: "Inscrição confirmada", robots: { index: false, follow: false } };

export default async function PaginaObrigado({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await obterEventoPublico(slug);
  if (!evento) notFound();

  return (
    <main className={styles.obrigado}>
      <LimparRascunho eventoId={evento.id} />
      <Logo largura={140} prioridade />
      <div className="rc-alert rc-alert--success" role="status">
        <CircleCheck className="rc-icon" aria-hidden="true" />
        <div>
          <strong className="rc-alert__title">Inscrição confirmada</strong>
          {evento.nome}
        </div>
      </div>
      <h1>Obrigado!</h1>
      <RichText doc={evento.agradecimento} />
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
    </main>
  );
}
