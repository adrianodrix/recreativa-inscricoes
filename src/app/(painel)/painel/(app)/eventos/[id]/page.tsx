import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { listarBrincadeiras } from "@/lib/brincadeiras/consultas";
import { obterEvento } from "@/lib/eventos/consultas";
import { resumirInscritos } from "@/lib/inscritos/consultas";
import { listarTimes } from "@/lib/times/consultas";
import { PainelStatus } from "../PainelStatus";
import { CartaoWhatsapp } from "../CartaoWhatsapp";
import { CartaoBrincadeiras } from "./CartaoBrincadeiras";
import { CartaoCategorias } from "./CartaoCategorias";
import { CartaoComida } from "./CartaoComida";
import { CartaoTimes } from "./CartaoTimes";
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

/* Painel do evento: situação das inscrições, atalhos e números. A edição fica em /editar. */
export default async function PaginaEvento({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const [evento, resumo, brincadeiras, times] = await Promise.all([obterEvento(id), resumirInscritos(id), listarBrincadeiras(id), listarTimes(id)]);
  if (!evento) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <h1>{evento.nome}</h1>
        <div className={styles.acoes}>
          {pode(usuario.perfil, "editar_evento") && (
            <Link href={`/painel/eventos/${id}/editar`} className="rc-btn rc-btn--secondary rc-btn--sm">
              <Pencil className="rc-icon" aria-hidden="true" /> Editar evento
            </Link>
          )}
          <a href={`/${evento.slug}`} target="_blank" rel="noreferrer" className="rc-btn rc-btn--sm">
            <ExternalLink className="rc-icon" aria-hidden="true" /> /{evento.slug}
          </a>
        </div>
      </div>
      {query.salvo && <Alerta tipo="success">Evento salvo.</Alerta>}
      <div className={styles.painelEvento}>
        <PainelStatus evento={evento} perfil={usuario.perfil} />
        <nav className={styles.atalhos} aria-label="Seções do evento">
          <Link href={`/painel/eventos/${id}/brincadeiras`} className="rc-btn rc-btn--secondary">Brincadeiras</Link>
          <Link href={`/painel/eventos/${id}/inscritos`} className="rc-btn rc-btn--secondary">Inscritos</Link>
          <Link href={`/painel/eventos/${id}/times`} className="rc-btn rc-btn--secondary">Times</Link>
        </nav>
        <CartaoCategorias contagem={resumo.porCategoria} />
        <CartaoBrincadeiras brincadeiras={brincadeiras} />
        <CartaoTimes times={times} elegiveis={resumo.porCategoria.crianca + resumo.porCategoria.jovem} montagem={evento.montagem_status} />
        <CartaoComida limites={evento.limites} contagem={resumo.comida} />
        <CartaoWhatsapp eventoId={id} perfil={usuario.perfil} />
      </div>
    </>
  );
}
