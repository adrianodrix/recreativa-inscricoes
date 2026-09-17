import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioEvento } from "../FormularioEvento";
import { PainelStatus } from "../PainelStatus";
import { CartaoWhatsapp } from "../CartaoWhatsapp";
import styles from "../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Pick<Props, "params">) {
  const { id } = await params;
  const evento = await obterEvento(id);
  return { title: evento?.nome ?? "Evento" };
}

export default async function PaginaEvento({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <h1>{evento.nome}</h1>
        <a href={`/${evento.slug}`} target="_blank" rel="noreferrer" className="rc-btn rc-btn--sm">
          <ExternalLink className="rc-icon" aria-hidden="true" /> /{evento.slug}
        </a>
      </div>
      {query.salvo && <Alerta tipo="success">Evento salvo.</Alerta>}
      <div className={styles.formulario}>
        <PainelStatus evento={evento} perfil={usuario.perfil} />
        <CartaoWhatsapp eventoId={evento.id} perfil={usuario.perfil} />
        <nav className={styles.atalhos} aria-label="Seções do evento">
          <Link href={`/painel/eventos/${evento.id}/brincadeiras`} className="rc-btn rc-btn--secondary">Brincadeiras</Link>
          <Link href={`/painel/eventos/${evento.id}/inscritos`} className="rc-btn rc-btn--secondary">Inscritos</Link>
          <Link href={`/painel/eventos/${evento.id}/times`} className="rc-btn rc-btn--secondary">Times</Link>
        </nav>
        {pode(usuario.perfil, "editar_evento") ? (
          <FormularioEvento evento={evento} />
        ) : (
          <p className="rc-hint">Seu perfil só permite visualizar este evento.</p>
        )}
      </div>
    </>
  );
}
