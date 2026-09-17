"use client";

import { Calendar, MapPin } from "lucide-react";
import { formatarDataExtenso, formatarHora } from "@/lib/datas";
import { RichText } from "@/lib/texto-rico/RichText";
import { useInscricao } from "../estado/InscricaoProvider";
import { StepShell } from "../ui/StepShell";

export function BoasVindasStep() {
  const { evento, concluir } = useInscricao();
  return (
    <StepShell titulo={evento.nome} rotuloAvancar="Começar inscrição" onAvancar={() => concluir()}>
      <ul className="rc-card__meta">
        <li>
          <Calendar className="rc-icon" aria-hidden="true" />
          {formatarDataExtenso(evento.data_evento)}, das {formatarHora(evento.hora_inicio)} às {formatarHora(evento.hora_fim)}
        </li>
        <li>
          <MapPin className="rc-icon" aria-hidden="true" />
          {evento.endereco}
        </li>
      </ul>
      {evento.boas_vindas && <RichText doc={evento.boas_vindas} />}
    </StepShell>
  );
}
