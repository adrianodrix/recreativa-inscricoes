import { Logo } from "@/components/marca/Logo";
import { FormularioLogin } from "./FormularioLogin";
import styles from "../auth.module.css";

export const metadata = { title: "Entrar no painel" };

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PaginaLogin({ searchParams }: Props) {
  const params = await searchParams;
  const voltar = typeof params.voltar === "string" ? params.voltar : undefined;
  const aviso = params.erro === "link" ? "O link expirou ou é inválido. Peça um novo em “Esqueci minha senha”." : undefined;
  return (
    <main className={styles.pagina}>
      <div className={styles.cartao}>
        <Logo largura={192} prioridade className={styles.logo} />
        <h1 className={styles.titulo}>Painel dos organizadores</h1>
        <FormularioLogin voltar={voltar} avisoInicial={aviso} />
      </div>
    </main>
  );
}
