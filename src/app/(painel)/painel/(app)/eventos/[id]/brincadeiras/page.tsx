import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { listarBrincadeiras } from "@/lib/brincadeiras/consultas";
import { ROTULO_CATEGORIA, UNIDADE_VAGA } from "@/lib/brincadeiras/schema";
import { obterEvento } from "@/lib/eventos/consultas";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "Brincadeiras" };

export default async function PaginaBrincadeiras({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const brincadeiras = await listarBrincadeiras(id);

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <p className="rc-hint">
            <Link href={`/painel/eventos/${id}`} className="rc-link">{evento.nome}</Link>
          </p>
          <h1>Brincadeiras</h1>
        </div>
        {pode(usuario.perfil, "editar_brincadeira") && (
          <Link href={`/painel/eventos/${id}/brincadeiras/nova`} className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Nova brincadeira
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Brincadeira salva.</Alerta>}
      {brincadeiras.length === 0 ? (
        <p className={styles.vazio}>Nenhuma brincadeira cadastrada. Elas aparecem no formulário uma por vez, conforme a idade de cada inscrito.</p>
      ) : (
        <ul className={styles.lista}>
          {brincadeiras.map((b) => (
            <li key={b.id}>
              <Link href={`/painel/eventos/${id}/brincadeiras/${b.id}`} className="rc-card rc-card--interactive">
                <header className="rc-card__header">
                  <h3 className="rc-card__title">{b.nome}</h3>
                  <span>
                    <span className="rc-badge rc-badge--roxo">{ROTULO_CATEGORIA[b.categoria]}</span>{" "}
                    {!b.ativo && <span className="rc-badge rc-badge--warning">Inativa</span>}
                  </span>
                </header>
                <ul className="rc-card__meta">
                  <li>
                    <Users className="rc-icon" aria-hidden="true" />
                    {b.vagas_ocupadas} de {b.limite_participantes} {UNIDADE_VAGA[b.categoria]}
                    {b.formato ? ` · ${b.formato === "em_grupo" ? "em times" : "individual"}` : ""}
                  </li>
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
