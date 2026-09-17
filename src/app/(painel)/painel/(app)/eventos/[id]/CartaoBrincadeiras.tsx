import { PartyPopper } from "lucide-react";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import type { BrincadeiraPainel } from "@/lib/brincadeiras/consultas";
import styles from "../../painel.module.css";

/* Vagas ocupadas em cada brincadeira, na unidade da categoria (pessoas, casais ou duplas). */
export function CartaoBrincadeiras({ brincadeiras }: { brincadeiras: BrincadeiraPainel[] }) {
  return (
    <article className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={PartyPopper}>Vagas por brincadeira</TituloCartao>
      </header>
      {brincadeiras.length === 0 ? (
        <p className="rc-hint">Nenhuma brincadeira cadastrada ainda.</p>
      ) : (
        <div className={styles.mosaico}>
          {brincadeiras.map((b) => (
            <Ocupacao key={b.id} total={b.vagas_ocupadas} limite={b.limite_participantes} rotulo={b.ativo ? b.nome : `${b.nome} · inativa`} />
          ))}
        </div>
      )}
    </article>
  );
}
