import { CircleCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { Logo } from "@/components/marca/Logo";
import { obterEventoPublico } from "@/lib/inscricao/publico";
import { RichText } from "@/lib/texto-rico/RichText";
import { DetalhesEvento } from "../DetalhesEvento";
import { LimparRascunho } from "./LimparRascunho";
import styles from "../publico.module.css";

export const dynamic = "force-dynamic";

/* Página pessoal de quem acabou de se inscrever: não vai para buscadores. */
export const metadata = { title: "Inscrição confirmada", robots: { index: false, follow: false } };

export default async function PaginaObrigado({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await obterEventoPublico(slug);
  if (!evento) notFound();

  return (
    <main className={styles.obrigado}>
      <LimparRascunho eventoId={evento.id} />
      <Logo largura={140} prioridade />
      <div className="rc-alert rc-alert--success" role="status">
        <CircleCheck className="rc-icon" aria-hidden="true" />
        <div>
          <strong className="rc-alert__title">Inscrição confirmada</strong>
          {evento.nome}
        </div>
      </div>
      <h1>Obrigado!</h1>
      <RichText doc={evento.agradecimento} />
      <DetalhesEvento evento={evento} />
    </main>
  );
}
