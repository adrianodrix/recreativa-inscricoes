import { Trash2, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterInscrito } from "@/lib/inscritos/consultas";
import { excluirInscrito, removerParticipacao } from "../actions";
import { FormularioComida } from "./FormularioComida";
import { FormularioInscrito } from "./FormularioInscrito";
import styles from "../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; iid: string }>;
}

const VINCULO = { principal: "Inscrito principal", conjuge: "Cônjuge", filho: "Filho(a)" } as const;
const PAPEL = { pessoa: "", conjuge: "casal", filho: "filho(a)", pai: "pai", mae: "mãe", responsavel: "responsável" } as const;

export async function generateMetadata({ params }: Props) {
  const { id, iid } = await params;
  const i = await obterInscrito(id, iid);
  return { title: i?.nome_completo ?? "Inscrito" };
}

export default async function PaginaInscrito({ params }: Props) {
  const [{ id, iid }, usuario] = await Promise.all([params, exigirLogin()]);
  const [evento, inscrito] = await Promise.all([obterEvento(id), obterInscrito(id, iid)]);
  if (!evento || !inscrito) notFound();
  const podeEditar = pode(usuario.perfil, "editar_inscrito");
  const excluir = excluirInscrito.bind(null, id, iid);
  const avisoExclusao =
    inscrito.vinculo === "principal"
      ? "Excluir este inscrito remove também o cônjuge e os filhos cadastrados por ele. Continuar?"
      : "Excluir este inscrito? A ação não pode ser desfeita.";

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <p className="rc-hint">
            <Link href={`/painel/eventos/${id}/inscritos`} className="rc-link">Inscritos · {evento.nome}</Link>
          </p>
          <h1>{inscrito.nome_completo}</h1>
          <p className="rc-hint">
            {VINCULO[inscrito.vinculo]}
            {inscrito.principal_nome ? ` de ${inscrito.principal_nome}` : ""} · {inscrito.idade} anos no evento
          </p>
        </div>
        {podeEditar && (
          <FormularioConfirmar acao={excluir} mensagem={avisoExclusao}>
            <button type="submit" className="rc-btn rc-btn--sm">
              <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
            </button>
          </FormularioConfirmar>
        )}
      </div>
      <div className={styles.formulario}>
        {podeEditar ? <FormularioInscrito eventoId={id} inscrito={inscrito} /> : <p className="rc-hint">Seu perfil só permite visualizar.</p>}
        {podeEditar && inscrito.idade > 12 && <FormularioComida eventoId={id} inscrito={inscrito} />}
        <section className={`rc-card ${styles.secao}`}>
          <h2>Brincadeiras</h2>
          {inscrito.participacoes.length === 0 ? (
            <p className="rc-hint">Nenhuma brincadeira. Para incluir, use “Incluir inscrito” com o fluxo completo.</p>
          ) : (
            <ul className={styles.lista}>
              {inscrito.participacoes.map((p) => {
                const remover = removerParticipacao.bind(null, id, iid, p.participacao_id);
                return (
                  <li key={p.participacao_id} className={styles.statusLinha}>
                    <span>
                      {p.brincadeira}
                      {PAPEL[p.papel] ? ` (${PAPEL[p.papel]})` : ""}
                    </span>
                    {podeEditar && (
                      <FormularioConfirmar acao={remover} mensagem="Remover desta brincadeira? Em casal ou dupla, a vaga inteira é liberada.">
                        <button type="submit" className="rc-btn rc-btn--sm">
                          <X className="rc-icon" aria-hidden="true" /> Remover
                        </button>
                      </FormularioConfirmar>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
