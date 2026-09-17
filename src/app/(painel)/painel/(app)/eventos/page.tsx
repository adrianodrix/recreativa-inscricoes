import { Calendar, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { formatarData, formatarHora } from "@/lib/datas";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { contarInscritos, listarEventos } from "@/lib/eventos/consultas";
import { ROTULO_MOTIVO, statusInscricoes } from "@/lib/eventos/status";
import { Ocupacao } from "./Ocupacao";
import ocupacao from "./Ocupacao.module.css";
import styles from "../painel.module.css";

export const metadata = { title: "Eventos" };

export default async function PaginaEventos() {
  const usuario = await exigirLogin();
  const eventos = await listarEventos();
  const totais = await Promise.all(eventos.map((e) => contarInscritos(e.id)));

  return (
    <>
      <div className={styles.titulo}>
        <h1>Eventos</h1>
        {pode(usuario.perfil, "editar_evento") && (
          <Link href="/painel/eventos/novo" className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Novo evento
          </Link>
        )}
      </div>
      {eventos.length === 0 ? (
        <p className={styles.vazio}>Nenhum evento cadastrado ainda.</p>
      ) : (
        <ul className={styles.lista}>
          {eventos.map((evento, i) => {
            const status = statusInscricoes(evento, totais[i]);
            return (
              <li key={evento.id}>
                <Link href={`/painel/eventos/${evento.id}`} className="rc-card rc-card--interactive">
                  <div className={ocupacao.comOcupacao}>
                    <div>
                      <header className="rc-card__header">
                        <h3 className="rc-card__title">{evento.nome}</h3>
                        {status.aberto ? (
                          <span className="rc-badge rc-badge--success">Inscrições abertas</span>
                        ) : (
                          <span className="rc-badge">{ROTULO_MOTIVO[status.motivo]}</span>
                        )}
                      </header>
                      <ul className="rc-card__meta">
                        <li>
                          <Calendar className="rc-icon" aria-hidden="true" />
                          {formatarData(evento.data_evento)}, {formatarHora(evento.hora_inicio)} às {formatarHora(evento.hora_fim)}
                        </li>
                        <li>
                          <MapPin className="rc-icon" aria-hidden="true" />
                          {evento.endereco}
                        </li>
                      </ul>
                    </div>
                    <Ocupacao total={totais[i]} limite={evento.limite_inscritos} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
