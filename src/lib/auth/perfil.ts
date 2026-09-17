import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { pode, type Acao, type Perfil } from "./permissoes";

export interface UsuarioPainel {
  id: string;
  email: string;
  nome: string;
  perfil: Perfil;
}

/* Usuário do painel logado e ativo, ou null. Cacheado por requisição. */
export const usuarioAtual = cache(async (): Promise<UsuarioPainel | null> => {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios_painel")
    .select("id, email, nome, perfil, ativo")
    .eq("id", user.id)
    .maybeSingle();
  if (!data || !data.ativo) return null;
  return { id: data.id, email: data.email, nome: data.nome, perfil: data.perfil };
});

/* Exige sessão de organizador ativo; senão manda para o login. */
export async function exigirLogin(): Promise<UsuarioPainel> {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/painel/login");
  return usuario;
}

export class SemPermissao extends Error {
  constructor(acao: Acao) {
    super(`Sem permissão para ${acao}`);
    this.name = "SemPermissao";
  }
}

/* Primeira linha de toda Server Action do painel. */
export async function exigirPerfil(...acoes: Acao[]): Promise<UsuarioPainel> {
  const usuario = await exigirLogin();
  for (const acao of acoes) {
    if (!pode(usuario.perfil, acao)) throw new SemPermissao(acao);
  }
  return usuario;
}
