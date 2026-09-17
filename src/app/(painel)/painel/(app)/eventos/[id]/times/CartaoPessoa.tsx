"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link2 } from "lucide-react";
import type { PessoaTime } from "@/lib/times/tipos";
import styles from "./quadro.module.css";

interface Props {
  pessoa: PessoaTime;
  vinculada: boolean;
}

/*
 * Cartão arrastável pela alça (ícone + nome). No toque, segurar e arrastar;
 * no teclado, Espaço pega, setas movem, Espaço solta.
 */
export function CartaoPessoa({ pessoa, vinculada }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: pessoa.id });
  return (
    <div ref={setNodeRef} className={`${styles.cartao} ${isDragging ? styles.cartaoArrastando : ""}`} style={{ transform: CSS.Translate.toString(transform) }}>
      <span className={styles.alca} {...listeners} {...attributes} aria-label={`Arrastar ${pessoa.nome}`}>
        <GripVertical className="rc-icon rc-icon--sm" aria-hidden="true" />
        {pessoa.nome}
      </span>
      <span className={styles.cartaoInfo}>
        <span className={`rc-badge ${pessoa.categoria === "crianca" ? "rc-badge--brand" : "rc-badge--roxo"}`}>{pessoa.idade} anos</span>
        {vinculada && (
          <span className="rc-hint" title="Faz parte de uma dupla com responsável: fica no mesmo time">
            <Link2 className="rc-icon rc-icon--sm" aria-hidden="true" />
          </span>
        )}
      </span>
    </div>
  );
}
