import { Pencil, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { TituloCartao } from "@/components/painel/TituloCartao";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { listarMembrosDoTime, obterTime } from "@/lib/times/consultas";
import { IconeTime } from "../IconeTime";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; tid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Pick<Props, "params">) {
  const { id, tid } = await params;
  const time = await obterTime(id, tid);
  return { title: time?.nome ?? "Time" };
}

/* Página do time: quem está nele. A edição fica em /editar. */
export default async function PaginaTime({ params, searchParams }: Props) {
  const [{ id, tid }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const [evento, time, membros] = await Promise.all([obterEvento(id), obterTime(id, tid), listarMembrosDoTime(id, tid)]);
  if (!evento || !time) notFound();
  const criancas = membros.filter((m) => m.categoria === "crianca").length;

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Times", href: `/painel/eventos/${id}/times` }]} />
          <div className={styles.acoes}>
            <IconeTime imagemPath={time.imagem_path} cor={time.cor_padrao} icone={time.icone_padrao} tamanho={48} />
            <h1>{time.nome}</h1>
          </div>
          <p className="rc-hint">
            {membros.length} {membros.length === 1 ? "membro" : "membros"} · {criancas} crianças · {membros.length - criancas} jovens
          </p>
        </div>
        {pode(usuario.perfil, "gerir_times") && (
          <Link href={`/painel/eventos/${id}/times/${tid}/editar`} className="rc-btn rc-btn--secondary rc-btn--sm">
            <Pencil className="rc-icon" aria-hidden="true" /> Editar time
          </Link>
        )}
      </div>
      {query.salvo && <Alerta tipo="success">Time salvo.</Alerta>}
      <section className="rc-card">
        <header className="rc-card__header">
          <TituloCartao icone={Users}>Membros</TituloCartao>
          <span className={`rc-badge ${evento.montagem_status === "confirmado" ? "rc-badge--success" : ""}`}>
            {evento.montagem_status === "confirmado" ? "Montagem confirmada" : "Montagem em rascunho"}
          </span>
        </header>
        {membros.length === 0 ? (
          <p className="rc-hint">
            Nenhum membro ainda. Os membros vêm da <Link href={`/painel/eventos/${id}/times`} className="rc-link">montagem dos times</Link>.
          </p>
        ) : (
          <ol className={styles.participantes}>
            {membros.map((m) => (
              <li key={m.id}>
                <span className={styles.participante}>
                  <Link href={`/painel/eventos/${id}/inscritos/${m.id}`} className="rc-link">
                    {m.nome}
                  </Link>
                  <span className="rc-hint">
                    {m.apelido ? `“${m.apelido}” · ` : ""}
                    {m.idade} anos · {m.categoria === "crianca" ? "criança" : "jovem"}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
