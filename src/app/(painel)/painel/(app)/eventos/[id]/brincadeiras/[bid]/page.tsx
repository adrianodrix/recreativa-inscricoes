import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { listarVagasDaBrincadeira, obterBrincadeira } from "@/lib/brincadeiras/consultas";
import { ROTULO_CATEGORIA } from "@/lib/brincadeiras/schema";
import { obterEvento } from "@/lib/eventos/consultas";
import { Participantes } from "./Participantes";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; bid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Pick<Props, "params">) {
  const { id, bid } = await params;
  const b = await obterBrincadeira(id, bid);
  return { title: b?.nome ?? "Brincadeira" };
}

/* Página da brincadeira: quem está inscrito nela. A edição fica em /editar. */
export default async function PaginaBrincadeira({ params, searchParams }: Props) {
  const [{ id, bid }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const [evento, brincadeira, vagas] = await Promise.all([obterEvento(id), obterBrincadeira(id, bid), listarVagasDaBrincadeira(id, bid)]);
  if (!evento || !brincadeira) notFound();
  const formato = brincadeira.formato === "em_grupo" ? "em times" : brincadeira.formato === "individual" ? "individual" : null;

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Brincadeiras", href: `/painel/eventos/${id}/brincadeiras` }]} />
          <h1>{brincadeira.nome}</h1>
          <p className="rc-hint">
            {ROTULO_CATEGORIA[brincadeira.categoria]}
            {formato ? ` · ${formato}` : ""}
            {brincadeira.ativo ? "" : " · inativa"}
          </p>
        </div>
        {pode(usuario.perfil, "editar_brincadeira") && (
          <Link href={`/painel/eventos/${id}/brincadeiras/${bid}/editar`} className="rc-btn rc-btn--secondary rc-btn--sm">
            <Pencil className="rc-icon" aria-hidden="true" /> Editar brincadeira
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Brincadeira salva.</Alerta>}
      <Participantes eventoId={id} brincadeira={brincadeira} vagas={vagas} />
    </>
  );
}
