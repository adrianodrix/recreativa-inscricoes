import { Plus, User, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { ListaOrdenavel } from "@/components/painel/ListaOrdenavel";
import { Ocupacao } from "@/components/painel/Ocupacao";
import indicadores from "@/components/painel/indicadores.module.css";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { listarBrincadeiras } from "@/lib/brincadeiras/consultas";
import { ROTULO_CATEGORIA, UNIDADE_VAGA } from "@/lib/brincadeiras/schema";
import { obterEvento } from "@/lib/eventos/consultas";
import { reordenarBrincadeiras } from "./actions";
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
  const podeEditar = pode(usuario.perfil, "editar_brincadeira");

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <p className="rc-hint">
            <Link href={`/painel/eventos/${id}`} className="rc-link">{evento.nome}</Link>
          </p>
          <h1>Brincadeiras</h1>
        </div>
        {podeEditar && (
          <Link href={`/painel/eventos/${id}/brincadeiras/nova`} className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Nova brincadeira
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Brincadeira salva.</Alerta>}
      {brincadeiras.length === 0 ? (
        <p className={styles.vazio}>Nenhuma brincadeira cadastrada. Elas aparecem no formulário uma por vez, conforme a idade de cada inscrito.</p>
      ) : (
        <>
          {podeEditar && brincadeiras.length > 1 && <p className="rc-hint">Esta é a ordem em que aparecem no formulário. Arraste pela alça para mudar.</p>}
          <ListaOrdenavel
            key={brincadeiras.map((b) => b.id).join("|")}
            id="lista-brincadeiras"
            podeReordenar={podeEditar}
            aoReordenar={reordenarBrincadeiras.bind(null, id)}
            itens={brincadeiras.map((b) => ({
              id: b.id,
              rotulo: b.nome,
              conteudo: (
              <Link href={`/painel/eventos/${id}/brincadeiras/${b.id}`} className="rc-card rc-card--interactive">
                <div className={indicadores.comOcupacao}>
                  <div>
                    <header className="rc-card__header">
                      <h3 className="rc-card__title">{b.nome}</h3>
                      <span>
                        <span className="rc-badge rc-badge--roxo">{ROTULO_CATEGORIA[b.categoria]}</span>{" "}
                        {!b.ativo && <span className="rc-badge rc-badge--warning">Inativa</span>}
                      </span>
                    </header>
                    {b.formato && (
                      <ul className="rc-card__meta">
                        <li>
                          {b.formato === "em_grupo" ? <Users className="rc-icon" aria-hidden="true" /> : <User className="rc-icon" aria-hidden="true" />}
                          {b.formato === "em_grupo" ? "Em times" : "Individual"}
                        </li>
                      </ul>
                    )}
                  </div>
                  <Ocupacao total={b.vagas_ocupadas} limite={b.limite_participantes} rotulo={UNIDADE_VAGA[b.categoria]} />
                </div>
              </Link>
              ),
            }))}
          />
        </>
      )}
    </>
  );
}
