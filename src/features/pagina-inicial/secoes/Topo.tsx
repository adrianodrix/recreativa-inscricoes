import Link from "next/link";
import { Logo } from "@/components/marca/Logo";
import styles from "../pagina-inicial.module.css";

export interface Ancora {
  id: string;
  rotulo: string;
}

interface Props {
  ancoras: Ancora[];
  inscricao: { href: string; rotulo: string } | null;
}

/*
 * Barra fixa da página. O menu do celular é um <details>: abre e fecha sem
 * JavaScript, então a página inteira continua sendo servida pronta.
 */
export function Topo({ ancoras, inscricao }: Props) {
  const links = ancoras.map((a) => (
    <a key={a.id} href={`#${a.id}`}>
      {a.rotulo}
    </a>
  ));

  return (
    <header className={styles.topo}>
      <div className={styles.topoConteudo}>
        <Link href="/" aria-label="Recreativa · início">
          <Logo variante="laranja" formato="horizontal" largura={124} prioridade />
        </Link>

        <nav className={styles.topoLinks} aria-label="Seções da página">
          {links}
        </nav>

        <div className={styles.topoAcoes}>
          {inscricao && (
            <Link href={inscricao.href} className={`rc-btn rc-btn--primary rc-btn--sm ${styles.botaoPill}`}>
              {inscricao.rotulo}
            </Link>
          )}
          {ancoras.length > 0 && (
            <details className={styles.menuCelular}>
              <summary aria-label="Abrir menu">Menu</summary>
              <nav className={styles.menuAberto} aria-label="Seções da página">
                {links}
              </nav>
            </details>
          )}
        </div>
      </div>
    </header>
  );
}
