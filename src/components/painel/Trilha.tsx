import { ChevronRight } from "lucide-react";
import Link from "next/link";
import styles from "./Trilha.module.css";

export interface PassoTrilha {
  rotulo: string;
  href: string;
}

/* Caminho até a página atual, acima do título. Todos os passos são links; a página atual é o próprio h1. */
export function Trilha({ passos }: { passos: PassoTrilha[] }) {
  return (
    <nav aria-label="Caminho" className={styles.trilha}>
      <ol>
        {passos.map((p, i) => (
          <li key={p.href}>
            {i > 0 && <ChevronRight className={styles.seta} aria-hidden="true" />}
            <Link href={p.href}>{p.rotulo}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* Passos comuns das telas de um evento. */
export const trilhaEventos: PassoTrilha = { rotulo: "Eventos", href: "/painel/eventos" };
export function trilhaEvento(id: string, nome: string): PassoTrilha[] {
  return [trilhaEventos, { rotulo: nome, href: `/painel/eventos/${id}` }];
}
