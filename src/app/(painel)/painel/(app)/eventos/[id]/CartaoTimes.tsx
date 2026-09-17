import { Flag } from "lucide-react";
import Link from "next/link";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import type { TimeComContagem } from "@/lib/times/consultas";
import { equilibrioDoTime } from "@/lib/times/equilibrio";
import styles from "../../painel.module.css";

interface Props {
  eventoId: string;
  perfil: Perfil;
  times: TimeComContagem[];
  /* Crianças e jovens inscritos: só eles entram nos times (T13). */
  elegiveis: number;
  montagem: "rascunho" | "confirmado";
}

/* Membros de cada time contra a cota (elegíveis divididos igualmente) e o equilíbrio entre eles. */
export function CartaoTimes({ eventoId, perfil, times, elegiveis, montagem }: Props) {
  const contagens = times.map((t) => t.membros);
  const montados = contagens.some((n) => n > 0);
  return (
    <article className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={Flag} acao={{ href: `/painel/eventos/${eventoId}/times`, rotulo: "Ver times" }}>
          Times
        </TituloCartao>
        {montados && (
          <span className={`rc-badge ${montagem === "confirmado" ? "rc-badge--success" : "rc-badge--warning"}`}>
            {montagem === "confirmado" ? "Montagem confirmada" : "Montagem em rascunho"}
          </span>
        )}
      </header>
      {times.length === 0 ? (
        <div className={styles.acoes}>
          <p className="rc-hint">Nenhum time cadastrado. {elegiveis} pessoas elegíveis aguardam a montagem.</p>
          {pode(perfil, "gerir_times") && (
            <Link href={`/painel/eventos/${eventoId}/times`} className="rc-btn rc-btn--secondary rc-btn--sm">Cadastrar times</Link>
          )}
        </div>
      ) : (
        <div className={styles.mosaico}>
          {times.map((t) => {
            const eq = equilibrioDoTime(t.membros, contagens, elegiveis);
            return <Ocupacao key={t.id} total={t.membros} limite={eq.cota} rotulo={t.nome} nivel={eq.nivel} legenda={eq.legenda} />;
          })}
        </div>
      )}
    </article>
  );
}
