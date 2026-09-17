import { Flag } from "lucide-react";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import type { TimeComContagem } from "@/lib/times/consultas";
import { equilibrioDoTime } from "@/lib/times/equilibrio";
import styles from "../../painel.module.css";

interface Props {
  times: TimeComContagem[];
  /* Crianças e jovens inscritos: só eles entram nos times (T13). */
  elegiveis: number;
  montagem: "rascunho" | "confirmado";
}

/* Membros de cada time contra a cota (elegíveis divididos igualmente) e o equilíbrio entre eles. */
export function CartaoTimes({ times, elegiveis, montagem }: Props) {
  const contagens = times.map((t) => t.membros);
  const montados = contagens.some((n) => n > 0);
  return (
    <article className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={Flag}>Times</TituloCartao>
        {montados && (
          <span className={`rc-badge ${montagem === "confirmado" ? "rc-badge--success" : "rc-badge--warning"}`}>
            {montagem === "confirmado" ? "Montagem confirmada" : "Montagem em rascunho"}
          </span>
        )}
      </header>
      {times.length === 0 ? (
        <p className="rc-hint">Nenhum time cadastrado ainda. {elegiveis} pessoas elegíveis aguardam a montagem.</p>
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
