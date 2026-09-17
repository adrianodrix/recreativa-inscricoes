"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { Logo } from "@/components/marca/Logo";
import { DIGEST_INDISPONIVEL } from "@/lib/auth/indisponivel";
import styles from "./auth.module.css";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/* Erros do painel. Serviço fora do ar vira aviso com nova tentativa; a sessão não é derrubada. */
export default function ErroPainel({ error, reset }: Props) {
  const router = useRouter();
  const indisponivel = error.digest === DIGEST_INDISPONIVEL;
  // Só o reset remontaria o cliente com os mesmos dados; o refresh busca de novo no servidor.
  const tentarDeNovo = () => startTransition(() => { router.refresh(); reset(); });
  return (
    <main className={styles.pagina}>
      <div className={styles.cartao}>
        <Logo largura={160} className={styles.logo} />
        <h1 className={styles.titulo}>{indisponivel ? "Servidor sem resposta" : "Algo deu errado"}</h1>
        <Alerta tipo="warning">
          {indisponivel
            ? "Não foi possível confirmar sua sessão porque o serviço de autenticação não respondeu. Você continua conectado: aguarde alguns instantes e tente de novo."
            : "Esta página não pôde ser carregada. Tente de novo e, se continuar, avise quem administra o painel."}
        </Alerta>
        <button type="button" className="rc-btn rc-btn--primary" onClick={tentarDeNovo}>
          <RefreshCw className="rc-icon" aria-hidden="true" /> Tentar de novo
        </button>
        <Link href="/painel/eventos" className="rc-link">
          Ir para a lista de eventos
        </Link>
      </div>
    </main>
  );
}
