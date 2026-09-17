import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { carregarPrevia } from "@/features/pagina-inicial/previa";
import { PaginaInicial } from "@/features/pagina-inicial/PaginaInicial";
import { exigirLogin } from "@/lib/auth/perfil";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Prévia da página inicial" };

/* A própria página pública, com os dados do evento, mesmo antes de publicar (P6). */
export default async function PaginaPrevia({ params }: Props) {
  const [{ id }] = await Promise.all([params, exigirLogin()]);
  const dados = await carregarPrevia(id);
  if (!dados) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <h1>Prévia da página inicial</h1>
          <p className="rc-hint">É assim que a página fica. Quem não está logado só vê depois de publicar.</p>
        </div>
        <Link href={`/painel/eventos/${id}`} className="rc-btn rc-btn--sm">
          <ArrowLeft className="rc-icon" aria-hidden="true" /> Voltar ao evento
        </Link>
      </div>
      {dados.evento.motivo_fechado === "nao_publicado" && (
        <Alerta tipo="warning">Este evento ainda está em preparação: a página e a inscrição estão fora do ar.</Alerta>
      )}
      <PaginaInicial dados={dados} />
    </>
  );
}
