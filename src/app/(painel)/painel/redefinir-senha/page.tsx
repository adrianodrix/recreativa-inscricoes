import Image from "next/image";
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
        <Image src="/marca/logo-recreativa-roxo.svg" alt="Recreativa" width={192} height={114} className={styles.logo} priority />
        <h1 className={styles.titulo}>Escolha sua senha</h1>
        <p className="rc-hint">Conta: {user.email}</p>
        <FormularioSenha acao={redefinirSenha} className={styles.formulario} />
      </div>
    </main>
  );
}
