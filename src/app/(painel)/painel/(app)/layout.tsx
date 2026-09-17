import type { ReactNode } from "react";
import { exigirLogin } from "@/lib/auth/perfil";
import { Cabecalho } from "./Cabecalho";
import styles from "./layout.module.css";

export default async function LayoutPainel({ children }: { children: ReactNode }) {
  const usuario = await exigirLogin();
  return (
    <div className={styles.app}>
      <Cabecalho usuario={usuario} />
      <main className={styles.conteudo}>{children}</main>
    </div>
  );
}
