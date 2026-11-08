import { UserRoundCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { ContatosOrganizacao } from "@/components/inscricao/ContatosOrganizacao";
import { Logo } from "@/components/marca/Logo";
import { obterEventoPublico } from "@/lib/inscricao/publico";
import { DetalhesEvento } from "../DetalhesEvento";
import { LimparRascunho } from "../obrigado/LimparRascunho";
import styles from "../publico.module.css";

export const dynamic = "force-dynamic";

/* Saída de quem tentou se inscrever e já estava inscrito: não vai para buscadores. */
export const metadata = { title: "Você já está inscrito", robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ quem?: string }>;
}

export default async function PaginaJaInscrito({ params, searchParams }: Props) {
  const { slug } = await params;
  const { quem } = await searchParams;
  const evento = await obterEventoPublico(slug);
  if (!evento) notFound();
  const porFamiliar = quem === "familiar";

  return (
    <main className={styles.obrigado}>
      <LimparRascunho eventoId={evento.id} />
      <Logo largura={140} prioridade />
      <div className="rc-alert rc-alert--success" role="status">
        <UserRoundCheck className="rc-icon" aria-hidden="true" />
        <div>
          <strong className="rc-alert__title">Você já está inscrito(a)</strong>
          {evento.nome}
        </div>
      </div>
      <h1>Está tudo certo!</h1>
      <p>
        {porFamiliar
          ? "Um familiar fez a sua inscrição, com as escolhas de comida e brincadeiras. Se houve inscrição em brincadeiras, a confirmação foi para o WhatsApp de quem inscreveu."
          : "Você já fez a sua inscrição. Se escolheu alguma brincadeira, a confirmação foi para o WhatsApp informado."}
      </p>
      <section className="rc-card">
        <header className="rc-card__header">
          <h2 className="rc-card__title">Precisa mudar alguma coisa?</h2>
        </header>
        <p>
          Depois de confirmada, a inscrição só pode ser alterada pela organização.
          {evento.contatos.length > 0 ? " Fale com a gente pelo WhatsApp:" : " Procure a organização do evento."}
        </p>
        <ContatosOrganizacao contatos={evento.contatos} />
      </section>
      <DetalhesEvento evento={evento} />
    </main>
  );
}
