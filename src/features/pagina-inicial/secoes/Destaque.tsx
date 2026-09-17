import { CalendarDays, Camera, MapPin } from "lucide-react";
import Link from "next/link";
import { IconeTime } from "@/components/times/IconeTime";
import { formatarDataExtenso, formatarHora } from "@/lib/datas";
import { ROTULO_MOTIVO } from "@/lib/eventos/status";
import type { Fase } from "@/lib/pagina-inicial/fase";
import type { EventoDestaque, TimePublico } from "../tipos";
import styles from "../pagina-inicial.module.css";

interface Props {
  evento: EventoDestaque;
  times: TimePublico[];
  fase: Fase;
}

/* Capa da marca: degradê com grão, chamada do evento e o que fazer agora (P7). */
export function Destaque({ evento, times, fase }: Props) {
  const vagas = evento.limite_inscritos - evento.total_inscritos;
  return (
    <section className={`rc-surface-brand rc-surface-brand--degrade ${styles.destaque}`}>
      <div className={styles.destaqueConteudo}>
        {evento.subtitulo && <span className={styles.chamada}>{evento.subtitulo}</span>}
        <h1 className={styles.tituloDestaque}>{evento.nome}</h1>
        {evento.descricao && <p className={styles.descricao}>{evento.descricao}</p>}

        <ul className={styles.dados}>
          <li>
            <CalendarDays className="rc-icon" aria-hidden="true" />
            {formatarDataExtenso(evento.data_evento)}, das {formatarHora(evento.hora_inicio)} às {formatarHora(evento.hora_fim)}
          </li>
          <li>
            <MapPin className="rc-icon" aria-hidden="true" />
            <a href={evento.link_maps} target="_blank" rel="noreferrer" className={styles.linkClaro}>
              {evento.endereco}
            </a>
          </li>
        </ul>

        <div className={styles.acoesDestaque}>
          {fase.fase === "abertas" && (
            <>
              <Link href={`/${evento.slug}`} className={`rc-btn rc-btn--primary ${styles.botaoPill}`}>
                Me inscrever
              </Link>
              {vagas > 0 && vagas <= 30 && <span className={styles.aviso}>Restam {vagas} vagas</span>}
            </>
          )}
          {fase.fase === "em_breve" && (
            <span className={styles.aviso}>As inscrições abrem em {formatarDataExtenso(evento.inscricoes_inicio.slice(0, 10))}.</span>
          )}
          {fase.fase === "encerradas" && <span className={styles.aviso}>{ROTULO_MOTIVO[fase.motivo]}</span>}
          {fase.fase === "realizado" && (
            <>
              <span className={styles.aviso}>A {evento.nome} já aconteceu. Obrigado a cada família que veio!</span>
              {evento.link_fotos && (
                <a href={evento.link_fotos} target="_blank" rel="noreferrer" className={`rc-btn rc-btn--primary ${styles.botaoPill}`}>
                  <Camera className="rc-icon" aria-hidden="true" /> Ver as fotos
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {times.length > 0 && (
        <ul className={styles.mascotes} aria-label="Equipes do evento">
          {times.slice(0, 4).map((t) => (
            <li key={t.id}>
              <IconeTime imagemPath={t.imagem_path} cor={t.cor_padrao} icone={t.icone_padrao} tamanho={72} />
              <span>{t.nome}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
