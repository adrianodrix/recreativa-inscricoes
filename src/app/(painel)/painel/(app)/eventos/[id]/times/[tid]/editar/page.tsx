import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterTime } from "@/lib/times/consultas";
import { excluirTime } from "../../actions";
import { FormularioTime } from "../../FormularioTime";
import styles from "../../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; tid: string }>;
}

export const metadata = { title: "Editar time" };

export default async function PaginaEditarTime({ params }: Props) {
  const [{ id, tid }] = await Promise.all([params, exigirPerfil("gerir_times")]);
  const [evento, time] = await Promise.all([obterEvento(id), obterTime(id, tid)]);
  if (!evento || !time) notFound();
  const excluir = excluirTime.bind(null, id, tid);
  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha
            passos={[
              ...trilhaEvento(id, evento.nome),
              { rotulo: "Times", href: `/painel/eventos/${id}/times` },
              { rotulo: time.nome, href: `/painel/eventos/${id}/times/${tid}` },
            ]}
          />
          <h1>Editar time</h1>
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
