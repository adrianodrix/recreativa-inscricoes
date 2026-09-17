import { notFound } from "next/navigation";
import { Formulario } from "@/features/inscricao/ui/Formulario";
import { exigirPerfil } from "@/lib/auth/perfil";
import { obterEvento } from "@/lib/eventos/consultas";
import { obterEventoPublico } from "@/lib/inscricao/publico";
import { enviarInscricaoPainel } from "../actions";

export const metadata = { title: "Incluir inscrito" };

/* O painel reutiliza o formulário público: mesmas perguntas e mesmos limites. */
export default async function PaginaNovoInscrito({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, exigirPerfil("editar_inscrito")]);
  const evento = await obterEvento(id);
  if (!evento) notFound();
  const publico = await obterEventoPublico(evento.slug);
  if (!publico) notFound();
  return <Formulario evento={publico} enviar={enviarInscricaoPainel} destino={`/painel/eventos/${id}/inscritos?salvo=1`} />;
}
