import { Utensils } from "lucide-react";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import { ROTULO_COMIDA, TIPOS_COMIDA, type TipoComida } from "@/lib/eventos/comida";
import styles from "../../painel.module.css";

interface Props {
  limites: Record<TipoComida, number>;
  contagem: Record<TipoComida, number>;
}

/* Estoque de comida e bebida (E7): cada inscrito leva uma unidade, contra o limite do evento. */
export function CartaoComida({ limites, contagem }: Props) {
  const tipos = TIPOS_COMIDA.filter((t) => limites[t] > 0);
  return (
    <article className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={Utensils}>Comida e bebida</TituloCartao>
      </header>
      {tipos.length === 0 ? (
        <p className="rc-hint">Este evento não pede comida ou bebida. Defina os limites na edição do evento.</p>
      ) : (
        <div className={styles.mosaico}>
          {tipos.map((t) => (
            <Ocupacao key={t} total={contagem[t]} limite={limites[t]} rotulo={ROTULO_COMIDA[t]} />
          ))}
        </div>
      )}
    </article>
  );
}
