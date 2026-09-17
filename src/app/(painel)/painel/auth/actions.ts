"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { destinoSeguro } from "@/lib/auth/destino";
import { env } from "@/lib/env";
import { criarClienteServidor } from "@/lib/supabase/server";

export interface EstadoAuth {
  erro?: string;
  ok?: string;
}

const schemaLogin = z.object({
  email: z.email(),
  senha: z.string().min(1),
  voltar: z.string().optional(),
});

export async function entrar(_: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const dados = schemaLogin.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: "Informe e-mail e senha." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });
  if (error) return { erro: "E-mail ou senha inválidos." };

  const { data: perfil } = await supabase.rpc("perfil_atual");
  if (!perfil) {
    await supabase.auth.signOut();
    return { erro: "Esta conta não tem acesso ao painel." };
  }

  redirect(destinoSeguro(dados.data.voltar));
}

export async function esqueciSenha(_: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const email = z.email().safeParse(form.get("email"));
  if (!email.success) return { erro: "Informe um e-mail válido." };

  const supabase = await criarClienteServidor();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${env().APP_URL}/painel/auth/confirmar?next=/painel/redefinir-senha`,
  });
  // Resposta neutra: não revela se o e-mail existe.
  return { ok: "Se o e-mail estiver cadastrado, você receberá um link para definir a senha." };
}

const schemaSenha = z
  .object({
    senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmar: z.string(),
  })
  .refine((d) => d.senha === d.confirmar, { path: ["confirmar"], message: "As senhas não conferem." });

export async function redefinirSenha(_: EstadoAuth, form: FormData): Promise<EstadoAuth> {
  const dados = schemaSenha.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Senha inválida." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: dados.data.senha });
  if (error) return { erro: "Não foi possível salvar a senha. Abra o link do e-mail novamente." };

  redirect("/painel/eventos");
}

export async function sair(): Promise<void> {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/painel/login");
}
