import { exigirPerfil } from "@/lib/auth/perfil";
import { criarClienteServidor } from "@/lib/supabase/server";
import { FormularioNovoUsuario } from "./FormularioNovoUsuario";
import { LinhaUsuario } from "./LinhaUsuario";
import styles from "../painel.module.css";

export const metadata = { title: "Usuários do painel" };

export default async function PaginaUsuarios() {
  const atual = await exigirPerfil("gerir_usuarios");
  const supabase = await criarClienteServidor();
  const { data: usuarios } = await supabase
    .from("usuarios_painel")
    .select("id, nome, email, perfil, ativo")
    .order("nome");

  return (
    <>
      <div className={styles.titulo}>
        <h1>Usuários do painel</h1>
      </div>
      <div className={styles.formulario}>
        <FormularioNovoUsuario />
        <ul className={styles.lista}>
          {(usuarios ?? []).map((u) => (
            <LinhaUsuario key={u.id} usuario={u} souEu={u.id === atual.id} />
          ))}
        </ul>
      </div>
    </>
  );
}
