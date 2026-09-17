import { notFound } from "next/navigation";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioBrincadeira } from "../FormularioBrincadeira";
import styles from "../../../../painel.module.css";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";

export const metadata = { title: "Nova brincadeira" };

export default async function PaginaNovaBrincadeira({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, exigirPerfil("editar_brincadeira")]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Brincadeiras", href: `/painel/eventos/${id}/brincadeiras` }]} />
          <h1>Nova brincadeira</h1>
        </div>
      </div>
      <FormularioBrincadeira eventoId={id} brincadeira={null} />
    </>
  );
}
