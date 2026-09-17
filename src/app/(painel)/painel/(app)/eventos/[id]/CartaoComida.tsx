import { Utensils } from "lucide-react";
import Link from "next/link";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import { ROTULO_COMIDA, TIPOS_COMIDA, type TipoComida } from "@/lib/eventos/comida";
import styles from "../../painel.module.css";

interface Props {
  eventoId: string;
  perfil: Perfil;
  limites: Record<TipoComida, number>;
  contagem: Record<TipoComida, number>;
}

/* Estoque de comida e bebida (E7): cada inscrito leva uma unidade, contra o limite do evento. */
export function CartaoComida({ eventoId, perfil, limites, contagem }: Props) {
  const tipos = TIPOS_COMIDA.filter((t) => limites[t] > 0);
  return (
    <article className={`rc-card ${styles.cartao}`}>
      <header className="rc-card__header">
        <TituloCartao icone={Utensils}>Comida e bebida</TituloCartao>
      </header>
      {tipos.length === 0 ? (
        <div className={styles.acoes}>
          <p className="rc-hint">Este evento não pede comida ou bebida.</p>
          {pode(perfil, "editar_evento") && (
            <Link href={`/painel/eventos/${eventoId}/editar`} className="rc-btn rc-btn--secondary rc-btn--sm">Definir limites</Link>
          )}
        </div>
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
