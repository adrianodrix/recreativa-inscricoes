import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { DIGEST_INDISPONIVEL, servicoIndisponivel } from "./indisponivel";
import { pode, type Acao, type Perfil } from "./permissoes";

export interface UsuarioPainel {
  id: string;
  email: string;
  nome: string;
  perfil: Perfil;
}

/*
 * Autenticação ou banco fora do ar. O digest chega ao error.tsx do painel,
 * que mostra um aviso com "Tentar de novo" em vez de mandar para o login.
 */
export class ServicoIndisponivel extends Error {
  readonly digest = DIGEST_INDISPONIVEL;
  constructor(causa: unknown) {
    super("Serviço de autenticação indisponível", { cause: causa });
    this.name = "ServicoIndisponivel";
  }
}

/* Usuário do painel logado e ativo, ou null. Cacheado por requisição. */
export const usuarioAtual = cache(async (): Promise<UsuarioPainel | null> => {
  const supabase = await criarClienteServidor();
  let user;
  try {
    const r = await supabase.auth.getUser();
    if (r.error && servicoIndisponivel(r.error)) throw new ServicoIndisponivel(r.error);
    user = r.data.user;
  } catch (e) {
    throw e instanceof ServicoIndisponivel ? e : new ServicoIndisponivel(e);
  }
  if (!user) return null;

  const { data, error } = await supabase
    .from("usuarios_painel")
    .select("id, email, nome, perfil, ativo")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new ServicoIndisponivel(error); // consulta falhou, não é perfil inexistente
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
