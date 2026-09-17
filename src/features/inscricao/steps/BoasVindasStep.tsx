"use client";

import { CalendarDays, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import { formatarDataExtenso, formatarHora, formatarValor } from "@/lib/datas";
import { urlImagem } from "@/lib/storage/url";
import { RichText } from "@/lib/texto-rico/RichText";
import { useInscricao } from "../estado/InscricaoProvider";
import { StepShell } from "../ui/StepShell";
import styles from "../ui/formulario.module.css";

/* Abertura do formulário (P12): capa, data, local e o convite do organizador. */
export function BoasVindasStep() {
  const { evento, concluir } = useInscricao();
  const capa = urlImagem(evento.capa_path);

  return (
    <StepShell
      titulo={evento.nome}
      chapeu={evento.subtitulo}
      rotuloAvancar="Começar inscrição"
      onAvancar={() => concluir()}
    >
      {capa && (
        <Image src={capa} alt="" width={640} height={360} preload className={styles.capa} />
      )}
      <ul className="rc-card__meta">
        <li>
          <CalendarDays className="rc-icon" aria-hidden="true" />
          {formatarDataExtenso(evento.data_evento)}, das {formatarHora(evento.hora_inicio)} às {formatarHora(evento.hora_fim)}
        </li>
        <li>
          <MapPin className="rc-icon" aria-hidden="true" />
          <a href={evento.link_maps} target="_blank" rel="noreferrer" className="rc-link">
            {evento.endereco}
          </a>
        </li>
        {evento.valor_inscricao > 0 && (
          <li>
            <Ticket className="rc-icon" aria-hidden="true" />
            {formatarValor(evento.valor_inscricao)} por pessoa, combinado com os organizadores
          </li>
        )}
      </ul>
      {evento.boas_vindas ? <RichText doc={evento.boas_vindas} /> : evento.descricao && <p>{evento.descricao}</p>}
    </StepShell>
  );
}
