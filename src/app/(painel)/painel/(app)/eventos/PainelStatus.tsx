import { CalendarClock, ClipboardList, Compass } from "lucide-react";
import { formatarDataHora } from "@/lib/datas";
import type { EventoCompleto } from "@/lib/eventos/consultas";
import { ROTULO_MOTIVO, statusInscricoes } from "@/lib/eventos/status";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import { alternarInscricoes } from "./actions";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import indicadores from "@/components/painel/indicadores.module.css";
import painel from "../painel.module.css";

interface Props {
  evento: EventoCompleto;
  perfil: Perfil;
  /* O que fazer agora, calculado por proximoPasso(). */
  passo: string;
}

/* Situação efetiva das inscrições (V7) com a chave manual. */
export function PainelStatus({ evento, perfil, passo }: Props) {
  const status = statusInscricoes(evento, evento.total_inscritos);
  const alternar = alternarInscricoes.bind(null, evento.id, !evento.aberto_manual);
  return (
    <article className={`rc-card ${painel.status} ${painel.largura}`}>
      <div className={indicadores.comOcupacao}>
        <div>
          <header className="rc-card__header">
            <TituloCartao icone={ClipboardList}>Inscrições</TituloCartao>
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
      <p className={painel.passo}>
        <Compass className="rc-icon" aria-hidden="true" /> {passo}
      </p>
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
