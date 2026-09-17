import { CalendarClock } from "lucide-react";
import { formatarDataHora } from "@/lib/datas";
import type { EventoCompleto } from "@/lib/eventos/consultas";
import { ROTULO_MOTIVO, statusInscricoes } from "@/lib/eventos/status";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import { alternarInscricoes } from "./actions";
import painel from "../painel.module.css";
import styles from "./PainelStatus.module.css";

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
      <div className={styles.corpo}>
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

/* Inscritos contra o limite do evento: número grande, barra proporcional e vagas livres. */
function Ocupacao({ total, limite }: { total: number; limite: number }) {
  const fracao = limite > 0 ? Math.min(total / limite, 1) : 1;
  const livres = limite - total;
  const nivel = livres <= 0 ? "lotado" : fracao >= 0.9 ? "quase" : "normal";
  const legenda = livres > 0 ? `${livres} ${livres === 1 ? "vaga livre" : "vagas livres"}` : livres === 0 ? "Lotado" : `${-livres} acima do limite`;
  return (
    <div className={styles.ocupacao} data-nivel={nivel}>
      <span className={styles.ocupacaoRotulo}>Inscritos</span>
      <p className={styles.ocupacaoNumero}>
        <strong>{total}</strong> <span>de {limite}</span>
      </p>
      <div className={styles.ocupacaoBarra} role="meter" aria-label="Vagas ocupadas" aria-valuemin={0} aria-valuemax={limite} aria-valuenow={Math.min(total, limite)}>
        <span style={{ width: `${fracao * 100}%` }} />
      </div>
      <span className={styles.ocupacaoLegenda}>{legenda}</span>
    </div>
  );
}
