import { notFound } from "next/navigation";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirPerfil } from "@/lib/auth/perfil";
import { listarBrincadeiras } from "@/lib/brincadeiras/consultas";
import { obterEvento } from "@/lib/eventos/consultas";
import { FormularioItem } from "../FormularioItem";
import styles from "../../../../painel.module.css";

export const metadata = { title: "Novo momento" };

export default async function PaginaNovoItem({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, exigirPerfil("editar_pagina_inicial")]);
  const [evento, brincadeiras] = await Promise.all([obterEvento(id), listarBrincadeiras(id)]);
  if (!evento) notFound();

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha passos={[...trilhaEvento(id, evento.nome), { rotulo: "Programação", href: `/painel/eventos/${id}/programacao` }]} />
          <h1>Novo momento</h1>
        </div>
      </div>
      <FormularioItem eventoId={id} item={null} brincadeiras={brincadeiras} />
    </>
  );
}
