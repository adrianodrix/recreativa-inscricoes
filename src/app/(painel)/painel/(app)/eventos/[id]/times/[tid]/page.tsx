import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterTime } from "@/lib/times/consultas";
import { excluirTime } from "../actions";
import { FormularioTime } from "../FormularioTime";
import styles from "../../../../painel.module.css";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";

interface Props {
  params: Promise<{ id: string; tid: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id, tid } = await params;
  const time = await obterTime(id, tid);
  return { title: time?.nome ?? "Time" };
}

export default async function PaginaTime({ params }: Props) {
  const [{ id, tid }] = await Promise.all([params, exigirPerfil("gerir_times")]);
  const [evento, time] = await Promise.all([obterEvento(id), obterTime(id, tid)]);
  if (!evento || !time) notFound();
  const excluir = excluirTime.bind(null, id, tid);
  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Times", href: `/painel/eventos/${id}/times` }]} />
          <h1>{time.nome}</h1>
        </div>
        <FormularioConfirmar acao={excluir} mensagem="Excluir este time? Quem estava nele fica sem time.">
          <button type="submit" className="rc-btn rc-btn--sm">
            <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
          </button>
        </FormularioConfirmar>
      </div>
      <FormularioTime eventoId={id} time={time} />
    </>
  );
}
