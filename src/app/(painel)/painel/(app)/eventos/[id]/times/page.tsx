import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alerta } from "@/components/formulario/Alerta";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { statusInscricoes } from "@/lib/eventos/status";
import { carregarMontagem, listarTimes } from "@/lib/times/consultas";
import { FormularioTime } from "./FormularioTime";
import { IconeTime } from "./IconeTime";
import { QuadroTimes } from "./QuadroTimes";
import styles from "../../../painel.module.css";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata = { title: "Times" };

export default async function PaginaTimes({ params, searchParams }: Props) {
  const [{ id }, query, usuario] = await Promise.all([params, searchParams, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const [times, montagem] = await Promise.all([listarTimes(id), carregarMontagem(id, evento.montagem_semente)]);
  const podeGerir = pode(usuario.perfil, "gerir_times");
  const status = statusInscricoes(evento, evento.total_inscritos);

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <p className="rc-hint">
            <Link href={`/painel/eventos/${id}`} className="rc-link">{evento.nome}</Link>
          </p>
          <h1>Times</h1>
        </div>
      </div>
      {query.salvo && <Alerta tipo="success">Time salvo.</Alerta>}
      <div className={styles.formulario}>
        <section className={styles.secao}>
          <h2>Times cadastrados</h2>
          {times.length === 0 ? (
            <p className="rc-hint">Nenhum time ainda. A quantidade de times é o número de times cadastrados.</p>
          ) : (
            <ul className={styles.lista}>
              {times.map((t) => (
                <li key={t.id} className={`rc-card ${styles.statusLinha}`}>
                  <span style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                    <IconeTime imagemPath={t.imagem_path} cor={t.cor_padrao} icone={t.icone_padrao} />
                    <strong>{t.nome}</strong>
                    <span className="rc-hint">{t.membros} inscritos</span>
                  </span>
                  {podeGerir && (
                    <Link href={`/painel/eventos/${id}/times/${t.id}`} className="rc-btn rc-btn--sm">
                      <Pencil className="rc-icon" aria-hidden="true" /> Editar
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
          {podeGerir && <FormularioTime eventoId={id} time={null} />}
        </section>
        <section className={styles.secao}>
          <h2>Montagem</h2>
          <p className="rc-hint">
            Só crianças e jovens entram nos times. Irmãos ficam separados; criança e responsável ficam juntos. {montagem.entrada.pessoas.length} pessoas elegíveis.
          </p>
          {podeGerir ? (
            <QuadroTimes eventoId={id} dados={montagem} times={times} status={evento.montagem_status} inscricoesEncerradas={!status.aberto} sementeInicial={evento.montagem_semente} />
          ) : (
            <p className="rc-hint">Seu perfil só permite visualizar.</p>
          )}
        </section>
      </div>
    </>
  );
}
