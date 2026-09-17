import { PartyPopper } from "lucide-react";
import Link from "next/link";
import { Ocupacao } from "@/components/painel/Ocupacao";
import { TituloCartao } from "@/components/painel/TituloCartao";
import { pode, type Perfil } from "@/lib/auth/permissoes";
import type { BrincadeiraPainel } from "@/lib/brincadeiras/consultas";
import styles from "../../painel.module.css";

/* Vagas ocupadas em cada brincadeira, na unidade da categoria (pessoas, casais ou duplas). */
interface Props {
  eventoId: string;
  perfil: Perfil;
  brincadeiras: BrincadeiraPainel[];
}

export function CartaoBrincadeiras({ eventoId, perfil, brincadeiras }: Props) {
  return (
    <article className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={PartyPopper} acao={{ href: `/painel/eventos/${eventoId}/brincadeiras`, rotulo: "Ver brincadeiras" }}>
          Vagas por brincadeira
        </TituloCartao>
      </header>
      {brincadeiras.length === 0 ? (
        <div className={styles.acoes}>
          <p className="rc-hint">Nenhuma brincadeira cadastrada. Elas aparecem no formulário conforme a idade de cada inscrito.</p>
          {pode(perfil, "editar_brincadeira") && (
            <Link href={`/painel/eventos/${eventoId}/brincadeiras/nova`} className="rc-btn rc-btn--secondary rc-btn--sm">Nova brincadeira</Link>
          )}
        </div>
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
