import { Logo } from "@/components/marca/Logo";
import { redirect } from "next/navigation";
import { FormularioSenha } from "@/components/formulario/FormularioSenha";
import { criarClienteServidor } from "@/lib/supabase/server";
import { redefinirSenha } from "../auth/actions";
import styles from "../auth.module.css";

export const metadata = { title: "Redefinir senha" };

export default async function PaginaRedefinirSenha() {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/painel/login?erro=link");

  return (
    <main className={styles.pagina}>
      <div className={styles.cartao}>
        <Logo largura={192} prioridade className={styles.logo} />
        <h1 className={styles.titulo}>Escolha sua senha</h1>
        <p className="rc-hint">Conta: {user.email}</p>
        <FormularioSenha acao={redefinirSenha} className={styles.formulario} />
      </div>
    </main>
  );
}
