import { formatarHora } from "@/lib/datas";
import type { EventoDestaque } from "../tipos";
import styles from "../pagina-inicial.module.css";

/* Três números do evento, como na faixa do template: edição, duração e equipes. */
export function Numeros({ evento, times }: { evento: EventoDestaque; times: number }) {
  const itens: { valor: string; rotulo: string }[] = [];
  if (evento.edicao) itens.push({ valor: `${evento.edicao}ª`, rotulo: "edição do evento" });
  itens.push({ valor: `${formatarHora(evento.hora_inicio)}–${formatarHora(evento.hora_fim)}`, rotulo: "de brincadeira" });
  if (times > 1) itens.push({ valor: String(times), rotulo: "equipes disputando" });
  if (itens.length < 2) return null;

  return (
    <ul className={styles.numeros}>
      {itens.map((i) => (
        <li key={i.rotulo}>
          <b>{i.valor}</b>
          <span>{i.rotulo}</span>
        </li>
      ))}
    </ul>
  );
}
