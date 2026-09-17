"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { TimeComContagem } from "@/lib/times/consultas";
import type { PessoaTime } from "@/lib/times/tipos";
import { CartaoPessoa } from "./CartaoPessoa";
import { IconeTime } from "./IconeTime";
import styles from "./quadro.module.css";

interface Props {
  id: string; // timeId ou "sem-time"
  titulo: string;
  time?: TimeComContagem;
  pessoas: PessoaTime[];
  vinculadas: Set<string>;
}

export function ColunaTime({ id, titulo, time, pessoas, vinculadas }: Props) {
  const { setNodeRef: setDroppable, isOver } = useDroppable({ id });
  // A coluna de um time também é um item ordenável: id próprio para não colidir com o alvo de soltar pessoas.
  const { setNodeRef: setOrdenavel, setActivatorNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({ id: `coluna:${id}`, data: { tipo: "coluna" }, disabled: !time });
  const criancas = pessoas.filter((p) => p.categoria === "crianca");
  const jovens = pessoas.filter((p) => p.categoria === "jovem");
  const media = (lista: PessoaTime[]) => (lista.length ? (lista.reduce((s, p) => s + p.idade, 0) / lista.length).toFixed(1) : "–");
  return (
    <section
      ref={(el) => {
        setDroppable(el);
        setOrdenavel(el);
      }}
      className={`${styles.coluna} ${isOver ? styles.colunaAtiva : ""} ${isDragging ? styles.colunaArrastando : ""}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={titulo}
    >
      <header
        ref={setActivatorNodeRef}
        className={`${styles.colunaCabecalho} ${time ? styles.colunaAlca : ""}`}
        {...(time ? { ...listeners, ...attributes, "aria-label": `Mover o time ${titulo}` } : {})}
      >
        {time && <GripVertical className="rc-icon rc-icon--sm" aria-hidden="true" />}
        {time && <IconeTime imagemPath={time.imagem_path} cor={time.cor_padrao} icone={time.icone_padrao} />}
        <div>
          <h3 className={styles.colunaTitulo}>{titulo}</h3>
          <p className={styles.colunaContagem}>
            {criancas.length} crianças (média {media(criancas)}) · {jovens.length} jovens (média {media(jovens)})
          </p>
        </div>
      </header>
      {pessoas.map((p) => (
        <CartaoPessoa key={p.id} pessoa={p} vinculada={vinculadas.has(p.id)} />
      ))}
      {pessoas.length === 0 && <p className="rc-hint">Arraste pessoas para cá.</p>}
    </section>
  );
}
