import { Calendar, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/marca/Logo";
import { Formulario } from "@/features/inscricao/ui/Formulario";
import { formatarDataExtenso, formatarHora } from "@/lib/datas";
import { ROTULO_MOTIVO, type MotivoFechado } from "@/lib/eventos/status";
import { obterEventoPublico } from "@/lib/inscricao/publico";
import { enviarInscricao } from "./actions";
import styles from "./publico.module.css";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const evento = await obterEventoPublico(slug);
  return { title: evento ? `Inscrição · ${evento.nome}` : "Evento" };
}

export default async function PaginaInscricao({ params }: Props) {
  const { slug } = await params;
  const evento = await obterEventoPublico(slug);
  if (!evento) notFound();

  if (evento.motivo_fechado) {
    return (
      <main className={styles.fechado}>
        <Logo largura={160} prioridade />
        <h1>{evento.nome}</h1>
        <p className="rc-badge rc-badge--warning">{ROTULO_MOTIVO[evento.motivo_fechado as MotivoFechado] ?? "Inscrições encerradas"}</p>
        <ul className="rc-card__meta">
          <li>
            <Calendar className="rc-icon" aria-hidden="true" />
            {formatarDataExtenso(evento.data_evento)}, {formatarHora(evento.hora_inicio)} às {formatarHora(evento.hora_fim)}
          </li>
          <li>
            <MapPin className="rc-icon" aria-hidden="true" />
            {evento.endereco}
          </li>
        </ul>
      </main>
    );
  }

  return <Formulario evento={evento} enviar={enviarInscricao} destino={`/${evento.slug}/obrigado`} />;
}
