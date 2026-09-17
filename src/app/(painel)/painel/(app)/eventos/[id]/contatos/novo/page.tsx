import { notFound } from "next/navigation";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioContato } from "../FormularioContato";
import styles from "../../../../painel.module.css";

export const metadata = { title: "Novo contato" };

export default async function PaginaNovoContato({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, exigirPerfil("editar_pagina_inicial")]);
  const evento = await obterEvento(id);
  if (!evento) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Contatos", href: `/painel/eventos/${id}/contatos` }]} />
          <h1>Novo contato</h1>
        </div>
      </div>
      <FormularioContato eventoId={id} contato={null} />
    </>
  );
}
