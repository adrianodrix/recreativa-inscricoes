import { Users } from "lucide-react";
import { Contador } from "@/components/painel/Contador";
import { CATEGORIAS_PESSOA, ROTULO_CATEGORIA_PESSOA, type CategoriaPessoa } from "@/lib/pessoas/categoria";
import styles from "../../painel.module.css";
import { TituloCartao } from "@/components/painel/TituloCartao";

/* Inscritos em cada categoria de pessoa, a mesma partição que decide as brincadeiras. */
export function CartaoCategorias({ contagem }: { contagem: Record<CategoriaPessoa, number> }) {
  return (
    <article className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={Users}>Inscritos por categoria</TituloCartao>
      </header>
      <div className={styles.mosaico}>
        {CATEGORIAS_PESSOA.map((c) => (
          <Contador key={c} valor={contagem[c]} rotulo={ROTULO_CATEGORIA_PESSOA[c].nome} descricao={ROTULO_CATEGORIA_PESSOA[c].regra} />
        ))}
      </div>
    </article>
  );
}
