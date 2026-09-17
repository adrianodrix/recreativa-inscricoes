import { faixaHorario, resumoDoDia, type ItemProgramacao } from "@/lib/pagina-inicial/programacao";
import { Secao } from "./Secao";
import styles from "../pagina-inicial.module.css";

/* O dia resumido em poucos cartões e, logo abaixo, a programação completa. */
export function Programacao({ itens }: { itens: ItemProgramacao[] }) {
  if (itens.length === 0) return null;
  const resumo = resumoDoDia(itens);

  return (
    <Secao id="programacao" titulo="O dia, resumido">
      <ul className={styles.resumoDia}>
        {resumo.map((i) => (
          <li key={i.id} className={styles.cartaoHora}>
            <span className={styles.hora}>{faixaHorario(i.hora_inicio, i.hora_fim)}</span>
            <strong>{i.titulo}</strong>
          </li>
        ))}
      </ul>

      {itens.length > resumo.length && (
        <details className={styles.detalhe}>
          <summary>Ver a programação completa</summary>
          <ul className={styles.listaHorarios}>
            {itens.map((i) => (
              <li key={i.id}>
                <span className={styles.hora}>{faixaHorario(i.hora_inicio, i.hora_fim)}</span>
                <span>
                  {i.titulo}
                  {i.detalhe && <span className={styles.complemento}> · {i.detalhe}</span>}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Secao>
  );
}
