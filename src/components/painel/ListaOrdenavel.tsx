"use client";

import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import styles from "./ListaOrdenavel.module.css";

export interface ItemOrdenavel {
  id: string;
  /* Nome lido pelo leitor de tela na alça ("Arrastar …"). */
  rotulo: string;
  conteudo: ReactNode;
}

interface Props {
  /* Fixo por lista: os ids de acessibilidade do dnd-kit precisam bater entre servidor e cliente. */
  id: string;
  itens: ItemOrdenavel[];
  podeReordenar: boolean;
  /* Recebe os ids na nova ordem; se falhar, a lista volta ao que era. */
  aoReordenar: (ids: string[]) => Promise<void>;
}

/*
 * Lista cuja ordem se define arrastando pela alça: mouse (6px), toque (segurar 200ms)
 * e teclado (Espaço, setas, Espaço). Quem chama passa key com os ids para
 * ressincronizar quando a ordem vier nova do servidor.
 */
export function ListaOrdenavel({ id, itens, podeReordenar, aoReordenar }: Props) {
  const [ordem, setOrdem] = useState(() => itens.map((i) => i.id));
  const [, iniciar] = useTransition();
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const porId = new Map(itens.map((i) => [i.id, i]));
  const lista = ordem.map((x) => porId.get(x)).filter((i): i is ItemOrdenavel => Boolean(i));

  function aoSoltar(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return;
    const anterior = ordem;
    const nova = arrayMove(ordem, ordem.indexOf(String(e.active.id)), ordem.indexOf(String(e.over.id)));
    setOrdem(nova);
    iniciar(async () => {
      try {
        await aoReordenar(nova);
      } catch {
        setOrdem(anterior);
      }
    });
  }

  if (!podeReordenar) {
    return (
      <ul className={styles.lista}>
        {lista.map((i) => (
          <li key={i.id}>{i.conteudo}</li>
        ))}
      </ul>
    );
  }

  return (
    <DndContext id={id} sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
      <SortableContext items={ordem} strategy={verticalListSortingStrategy}>
        <ul className={styles.lista}>
          {lista.map((i) => (
            <Item key={i.id} item={i} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function Item({ item }: { item: ItemOrdenavel }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li ref={setNodeRef} className={`${styles.item} ${isDragging ? styles.arrastando : ""}`} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <button ref={setActivatorNodeRef} type="button" className={styles.alca} {...listeners} {...attributes} aria-label={`Arrastar ${item.rotulo}`}>
        <GripVertical className="rc-icon" aria-hidden="true" />
      </button>
      <div className={styles.conteudo}>{item.conteudo}</div>
    </li>
  );
}
