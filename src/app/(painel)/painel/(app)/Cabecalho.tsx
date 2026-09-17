import { KeyRound, LogOut } from "lucide-react";
import { Logo } from "@/components/marca/Logo";
import Link from "next/link";
import type { UsuarioPainel } from "@/lib/auth/perfil";
import { pode, ROTULO_PERFIL } from "@/lib/auth/permissoes";
import { sair } from "../auth/actions";
import styles from "./layout.module.css";

export function Cabecalho({ usuario }: { usuario: UsuarioPainel }) {
  return (
    <header className={`rc-surface-brand ${styles.cabecalho}`}>
      <div className={styles.barra}>
        <Link href="/painel/eventos" aria-label="Painel · início">
          <Logo variante="laranja" formato="horizontal" largura={168} prioridade className={styles.logo} />
        </Link>
        <nav aria-label="Principal">
          <ul className={styles.nav}>
            <li>
              <Link href="/painel/eventos" className="rc-btn rc-btn--sm">
                Eventos
              </Link>
            </li>
            {pode(usuario.perfil, "gerir_usuarios") && (
              <li>
                <Link href="/painel/usuarios" className="rc-btn rc-btn--sm">
                  Usuários
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className={styles.usuario}>
          <span className={styles.usuarioNome}>{usuario.nome}</span>
          <span className="rc-badge rc-badge--brand">{ROTULO_PERFIL[usuario.perfil]}</span>
          <Link href="/painel/trocar-senha" className="rc-btn rc-btn--sm rc-btn--icon" aria-label="Trocar senha">
            <KeyRound className="rc-icon" aria-hidden="true" />
          </Link>
          <form action={sair}>
            <button type="submit" className="rc-btn rc-btn--sm rc-btn--icon" aria-label="Sair">
              <LogOut className="rc-icon" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
