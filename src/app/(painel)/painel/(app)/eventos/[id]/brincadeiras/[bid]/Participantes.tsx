import { Users } from "lucide-react";
import Link from "next/link";
import { TituloCartao } from "@/components/painel/TituloCartao";
import type { BrincadeiraPainel, PapelParticipante, VagaOcupada } from "@/lib/brincadeiras/consultas";
import { UNIDADE_VAGA } from "@/lib/brincadeiras/schema";
import styles from "../../../../painel.module.css";

const ROTULO_PAPEL: Partial<Record<PapelParticipante, string>> = { pai: "pai", mae: "mãe", responsavel: "responsável" };

interface Props {
  eventoId: string;
  brincadeira: BrincadeiraPainel;
  vagas: VagaOcupada[];
}

/* Quem ocupa cada vaga da brincadeira: pessoa, casal ou dupla, com link para o inscrito. */
export function Participantes({ eventoId, brincadeira, vagas }: Props) {
  const unidade = UNIDADE_VAGA[brincadeira.categoria];
  return (
    <section className="rc-card">
      <header className="rc-card__header">
        <TituloCartao icone={Users}>Participantes</TituloCartao>
        <span className="rc-badge rc-badge--roxo">
          {vagas.length} de {brincadeira.limite_participantes} {unidade}
        </span>
      </header>
      {vagas.length === 0 ? (
        <p className="rc-hint">Ninguém inscrito nesta brincadeira ainda.</p>
      ) : (
        <ol className={styles.participantes}>
          {vagas.map((v) => (
            <li key={v.id}>
              {v.pessoas.map((p, i) => (
                <span key={p.id} className={styles.participante}>
                  {i > 0 && <span className={styles.participanteSeparador}>+</span>}
                  <Link href={`/painel/eventos/${eventoId}/inscritos/${p.id}`} className="rc-link">
                    {p.nome}
                  </Link>
                  <span className="rc-hint">
                    {p.apelido ? `“${p.apelido}” · ` : ""}
                    {p.idade} anos
                    {ROTULO_PAPEL[p.papel] ? ` · ${ROTULO_PAPEL[p.papel]}` : ""}
                  </span>
                </span>
              ))}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
