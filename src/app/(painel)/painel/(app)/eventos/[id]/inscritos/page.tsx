import { Download, Plus, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { Alerta } from "@/components/formulario/Alerta";
import { Ocupacao } from "@/components/painel/Ocupacao";
import ocupacao from "@/components/painel/Ocupacao.module.css";
import { formatarWhatsapp } from "@/features/inscricao/modelo/validacoes";
import { ROTULO_COMIDA } from "@/lib/eventos/schema";
import { obterEvento } from "@/lib/eventos/consultas";
import { listarInscritos } from "@/lib/inscritos/consultas";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "Inscritos" };

const VINCULO = { principal: "Principal", conjuge: "Cônjuge", filho: "Filho(a)" } as const;

export default async function PaginaInscritos({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const busca = typeof query.busca === "string" ? query.busca : "";
  const inscritos = await listarInscritos(id, busca);

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <p className="rc-hint">
            <Link href={`/painel/eventos/${id}`} className="rc-link">{evento.nome}</Link>
          </p>
          <h1>Inscritos</h1>
        </div>
        <div className={styles.acoes}>
          {pode(usuario.perfil, "editar_inscrito") && (
            <Link href={`/painel/eventos/${id}/inscritos/novo`} className="rc-btn rc-btn--primary rc-btn--sm">
              <Plus className="rc-icon" aria-hidden="true" /> Incluir inscrito
            </Link>
          )}
          <a href={`/api/eventos/${id}/exportar?formato=xlsx`} className="rc-btn rc-btn--secondary rc-btn--sm">
            <Download className="rc-icon" aria-hidden="true" /> Planilha (XLSX)
          </a>
          <a href={`/api/eventos/${id}/exportar?formato=csv`} className="rc-btn rc-btn--sm">
            <Download className="rc-icon" aria-hidden="true" /> CSV
          </a>
        </div>
      </div>
      {query.salvo && <Alerta tipo="success">Inscrição registrada.</Alerta>}
      <form className={styles.acoes} role="search">
        <div className="rc-field" style={{ flex: 1 }}>
          <label className="rc-label" htmlFor="busca">Buscar por nome ou apelido</label>
          <input id="busca" name="busca" className="rc-input" defaultValue={busca} placeholder="Ex.: Maria" />
        </div>
        <button type="submit" className="rc-btn rc-btn--secondary" style={{ alignSelf: "end" }}>
          <Search className="rc-icon" aria-hidden="true" /> Buscar
        </button>
      </form>
      <section className={`rc-card ${styles.resumoLista}`} aria-label="Resumo">
        <div className={ocupacao.comOcupacao}>
          <header className="rc-card__header">
            <h3 className="rc-card__title">
              {inscritos.length} {inscritos.length === 1 ? "pessoa" : "pessoas"}
            </h3>
            <p className="rc-hint">{busca ? `Resultado da busca por “${busca}”` : "Todas as inscrições deste evento"}</p>
          </header>
          <Ocupacao total={evento.total_inscritos} limite={evento.limite_inscritos} />
        </div>
      </section>
      {inscritos.length === 0 ? (
        <p className={styles.vazio}>Nenhum inscrito encontrado.</p>
      ) : (
        <ul className={styles.lista}>
          {inscritos.map((i) => (
            <li key={i.id}>
              <Link href={`/painel/eventos/${id}/inscritos/${i.id}`} className="rc-card rc-card--interactive">
                <header className="rc-card__header">
                  <h3 className="rc-card__title">{i.nome_completo}</h3>
                  <span>
                    <span className="rc-badge">{VINCULO[i.vinculo]}</span> <span className="rc-badge rc-badge--roxo">{i.idade} anos</span>
                  </span>
                </header>
                <ul className="rc-card__meta">
                  {i.principal_nome && <li>Cadastrado por {i.principal_nome}</li>}
                  {i.whatsapp && <li>WhatsApp {formatarWhatsapp(i.whatsapp)}</li>}
                  {i.comida && <li>Leva: {ROTULO_COMIDA[i.comida]}</li>}
                  <li>{i.participacoes.length === 0 ? "Sem brincadeiras" : i.participacoes.map((p) => p.brincadeira).join(", ")}</li>
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
