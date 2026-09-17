"use client";

import { useDroppable } from "@dnd-kit/core";
import type { TimeComContagem } from "@/lib/times/consultas";
import type { PessoaTime, TimeDef } from "@/lib/times/tipos";
import { CartaoPessoa } from "./CartaoPessoa";
import { IconeTime } from "./IconeTime";
import styles from "./quadro.module.css";

interface Props {
  id: string; // timeId ou "sem-time"
  titulo: string;
  time?: TimeComContagem;
  pessoas: PessoaTime[];
  times: TimeDef[];
  vinculadas: Set<string>;
  aoMover: (pessoaId: string, timeId: string | null) => void;
}

export function ColunaTime({ id, titulo, time, pessoas, times, vinculadas, aoMover }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const criancas = pessoas.filter((p) => p.categoria === "crianca");
  const jovens = pessoas.filter((p) => p.categoria === "jovem");
  const media = (lista: PessoaTime[]) => (lista.length ? (lista.reduce((s, p) => s + p.idade, 0) / lista.length).toFixed(1) : "–");
  return (
    <section ref={setNodeRef} className={`${styles.coluna} ${isOver ? styles.colunaAtiva : ""}`} aria-label={titulo}>
      <header className={styles.colunaCabecalho}>
        {time && <IconeTime imagemPath={time.imagem_path} cor={time.cor_padrao} icone={time.icone_padrao} />}
        <div>
          <h3 className={styles.colunaTitulo}>{titulo}</h3>
          <p className={styles.colunaContagem}>
            {criancas.length} crianças (média {media(criancas)}) · {jovens.length} jovens (média {media(jovens)})
          </p>
        </div>
      </header>
      {pessoas.map((p) => (
        <CartaoPessoa key={p.id} pessoa={p} times={times} timeAtual={time?.id ?? null} vinculada={vinculadas.has(p.id)} aoMover={aoMover} />
      ))}
      {pessoas.length === 0 && <p className="rc-hint">Arraste pessoas para cá.</p>}
    </section>
  );
}
