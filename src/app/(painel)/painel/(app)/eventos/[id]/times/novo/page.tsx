import { notFound } from "next/navigation";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioTime } from "../FormularioTime";
import styles from "../../../../painel.module.css";

export const metadata = { title: "Novo time" };

export default async function PaginaNovoTime({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, exigirPerfil("gerir_times")]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Times", href: `/painel/eventos/${id}/times` }]} />
          <h1>Novo time</h1>
        </div>
      </div>
      <FormularioTime eventoId={id} time={null} />
    </>
  );
}
