"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link2 } from "lucide-react";
import type { PessoaTime, TimeDef } from "@/lib/times/tipos";
import styles from "./quadro.module.css";

interface Props {
  pessoa: PessoaTime;
  times: TimeDef[];
  timeAtual: string | null;
  vinculada: boolean;
  aoMover: (pessoaId: string, timeId: string | null) => void;
}

/* Cartão arrastável; o select "Mover para" cobre teclado e telas pequenas. */
export function CartaoPessoa({ pessoa, times, timeAtual, vinculada, aoMover }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: pessoa.id });
  return (
    <div ref={setNodeRef} className={`${styles.cartao} ${isDragging ? styles.cartaoArrastando : ""}`} style={{ transform: CSS.Translate.toString(transform) }}>
      <div className={styles.cartaoLinha}>
        <span className={styles.alca} {...listeners} {...attributes} aria-label={`Arrastar ${pessoa.nome}`}>
          <GripVertical className="rc-icon rc-icon--sm" aria-hidden="true" />
          {pessoa.nome}
        </span>
        <span className={`rc-badge ${pessoa.categoria === "crianca" ? "rc-badge--brand" : "rc-badge--roxo"}`}>
          {pessoa.idade} anos
        </span>
      </div>
      <div className={styles.cartaoLinha}>
        <label className={styles.mover}>
          Mover para{" "}
          <select value={timeAtual ?? ""} onChange={(e) => aoMover(pessoa.id, e.target.value || null)} className="rc-input" style={{ minHeight: "2rem", padding: "0 var(--spacing-2)", width: "auto" }}>
            <option value="">Sem time</option>
            {times.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
        {vinculada && (
          <span className="rc-hint" title="Faz parte de uma dupla com responsável: fica no mesmo time">
            <Link2 className="rc-icon rc-icon--sm" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}
