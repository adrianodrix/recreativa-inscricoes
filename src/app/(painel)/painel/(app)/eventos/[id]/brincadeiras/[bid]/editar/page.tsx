import { Trash2 } from "lucide-react";
import { notFound } from "next/navigation";
import { FormularioConfirmar } from "@/components/formulario/FormularioConfirmar";
import { Trilha, trilhaEvento } from "@/components/painel/Trilha";
import { exigirLogin } from "@/lib/auth/perfil";
import { pode } from "@/lib/auth/permissoes";
import { obterBrincadeira } from "@/lib/brincadeiras/consultas";
import { obterEvento } from "@/lib/eventos/consultas";
import { excluirBrincadeira } from "../../actions";
import { FormularioBrincadeira } from "../../FormularioBrincadeira";
import styles from "../../../../../painel.module.css";

interface Props {
  params: Promise<{ id: string; bid: string }>;
}

export const metadata = { title: "Editar brincadeira" };

export default async function PaginaEditarBrincadeira({ params }: Props) {
  const [{ id, bid }, usuario] = await Promise.all([params, exigirLogin()]);
  const [evento, brincadeira] = await Promise.all([obterEvento(id), obterBrincadeira(id, bid)]);
  if (!evento || !brincadeira) notFound();
  const podeEditar = pode(usuario.perfil, "editar_brincadeira");
  const excluir = excluirBrincadeira.bind(null, id, bid);

  return (
    <>
      <div className={styles.titulo}>
        <div>
          <Trilha
            passos={[
              ...trilhaEvento(id, evento.nome),
              { rotulo: "Brincadeiras", href: `/painel/eventos/${id}/brincadeiras` },
              { rotulo: brincadeira.nome, href: `/painel/eventos/${id}/brincadeiras/${bid}` },
            ]}
          />
          <h1>Editar brincadeira</h1>
        </div>
        {podeEditar && brincadeira.vagas_ocupadas === 0 && (
          <FormularioConfirmar acao={excluir} mensagem="Excluir esta brincadeira? Ela ainda não tem participantes.">
            <button type="submit" className="rc-btn rc-btn--sm">
              <Trash2 className="rc-icon" aria-hidden="true" /> Excluir
            </button>
          </FormularioConfirmar>
        )}
      </div>
      {podeEditar ? <FormularioBrincadeira eventoId={id} brincadeira={brincadeira} /> : <p className="rc-hint">Seu perfil só permite visualizar.</p>}
    </>
  );
}
