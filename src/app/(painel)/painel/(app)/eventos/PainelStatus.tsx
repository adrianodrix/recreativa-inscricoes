import { CalendarClock } from "lucide-react";
import { formatarDataHora } from "@/lib/datas";
import type { EventoCompleto } from "@/lib/eventos/consultas";
import { ROTULO_MOTIVO, statusInscricoes } from "@/lib/eventos/status";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import { alternarInscricoes } from "./actions";
import { Ocupacao } from "./Ocupacao";
import ocupacao from "./Ocupacao.module.css";
import painel from "../painel.module.css";

interface Props {
  evento: EventoCompleto;
  perfil: Perfil;
}

/* Situação efetiva das inscrições (V7) com a chave manual. */
export function PainelStatus({ evento, perfil }: Props) {
  const status = statusInscricoes(evento, evento.total_inscritos);
  const alternar = alternarInscricoes.bind(null, evento.id, !evento.aberto_manual);
  return (
    <article className={`rc-card ${painel.status}`}>
      <div className={ocupacao.comOcupacao}>
        <div>
          <header className="rc-card__header">
            <h3 className="rc-card__title">Inscrições</h3>
            {status.aberto ? (
              <span className="rc-badge rc-badge--success">Abertas</span>
            ) : (
              <span className="rc-badge rc-badge--danger">{ROTULO_MOTIVO[status.motivo]}</span>
            )}
          </header>
          <ul className="rc-card__meta">
            <li>
              <CalendarClock className="rc-icon" aria-hidden="true" />
              {formatarDataHora(evento.inscricoes_inicio)} até {formatarDataHora(evento.inscricoes_fim)}
            </li>
          </ul>
        </div>
        <Ocupacao total={evento.total_inscritos} limite={evento.limite_inscritos} />
      </div>
      {pode(perfil, "mudar_status") && (
        <footer className="rc-card__footer">
          <span className={painel.statusLinha}>Chave do organizador: {evento.aberto_manual ? "liberada" : "encerrada"}</span>
          <form action={alternar}>
            <button type="submit" className={`rc-btn rc-btn--sm ${evento.aberto_manual ? "" : "rc-btn--secondary"}`}>
              {evento.aberto_manual ? "Encerrar inscrições" : "Liberar inscrições"}
            </button>
          </form>
        </footer>
      )}
    </article>
  );
}
