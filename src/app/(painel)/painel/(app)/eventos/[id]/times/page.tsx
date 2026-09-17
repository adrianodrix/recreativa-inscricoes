import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaOrdenavel } from "@/components/painel/ListaOrdenavel";
import { Ocupacao } from "@/components/painel/Ocupacao";
import indicadores from "@/components/painel/indicadores.module.css";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { statusInscricoes } from "@/lib/eventos/status";
import { carregarMontagem, listarTimes } from "@/lib/times/consultas";
import { equilibrioDoTime } from "@/lib/times/equilibrio";
import { reordenarTimes } from "./actions";
import { IconeTime } from "@/components/times/IconeTime";
import { QuadroTimes } from "./QuadroTimes";
import styles from "../../../painel.module.css";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Times" };

export default async function PaginaTimes({ params }: Props) {
  const [{ id }, usuario] = await Promise.all([params, exigirLogin()]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const [times, montagem] = await Promise.all([listarTimes(id), carregarMontagem(id, evento.montagem_semente)]);
  const podeGerir = pode(usuario.perfil, "gerir_times");
  const status = statusInscricoes(evento, evento.total_inscritos);
  const contagens = times.map((t) => t.membros);
  const elegiveis = montagem.entrada.pessoas.length;

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={trilhaEvento(id, evento.nome)} />
          <h1>Times</h1>
        </div>
        {podeGerir && (
          <Link href={`/painel/eventos/${id}/times/novo`} className="rc-btn rc-btn--primary">
            <Plus className="rc-icon" aria-hidden="true" /> Novo time
          </Link>
        )}
      </div>
      <div className={styles.formulario}>
        <section className={styles.secao}>
          <h2>Times cadastrados</h2>
          {times.length === 0 ? (
            <p className="rc-hint">Nenhum time ainda. A quantidade de times é o número de times cadastrados.</p>
          ) : (
            <>
              {podeGerir && times.length > 1 && <p className="rc-hint">Esta é a ordem de exibição. Arraste pela alça para mudar.</p>}
              <ListaOrdenavel
                key={times.map((t) => t.id).join("|")}
                id="lista-times"
                podeReordenar={podeGerir}
                aoReordenar={reordenarTimes.bind(null, id)}
                itens={times.map((t) => {
                  const eq = equilibrioDoTime(t.membros, contagens, elegiveis);
                  return {
                    id: t.id,
                    rotulo: t.nome,
                    conteudo: (
                      <div className="rc-card">
                        <div className={`${indicadores.comOcupacao} ${indicadores.aoCentro}`}>
                          <div className={styles.acoes}>
                            <IconeTime imagemPath={t.imagem_path} cor={t.cor_padrao} icone={t.icone_padrao} />
                            <strong>{t.nome}</strong>
                            {podeGerir && (
                              <Link href={`/painel/eventos/${id}/times/${t.id}`} className="rc-btn rc-btn--sm">
                                <Pencil className="rc-icon" aria-hidden="true" /> Editar
                              </Link>
                            )}
                          </div>
                          <Ocupacao total={t.membros} limite={eq.cota} rotulo="membros" nivel={eq.nivel} legenda={eq.legenda} />
                        </div>
                      </div>
                    ),
                  };
                })}
              />
            </>
          )}
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
