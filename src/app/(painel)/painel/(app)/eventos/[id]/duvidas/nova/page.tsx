import { notFound } from "next/navigation";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioPergunta } from "../FormularioPergunta";
import styles from "../../../../painel.module.css";

export const metadata = { title: "Nova dúvida" };

export default async function PaginaNovaDuvida({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, exigirPerfil("editar_pagina_inicial")]);
  const evento = await obterEvento(id);
  if (!evento) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Dúvidas", href: `/painel/eventos/${id}/duvidas` }]} />
          <h1>Nova dúvida</h1>
        </div>
      </div>
      <FormularioPergunta eventoId={id} pergunta={null} />
    </>
  );
}
