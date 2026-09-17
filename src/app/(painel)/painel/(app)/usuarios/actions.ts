"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirPerfil } from "@/lib/auth/perfil";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import { criarClienteServidor } from "@/lib/supabase/server";

export interface EstadoUsuario {
  erro?: string;
  ok?: string;
}

const schemaNovo = z.object({
  nome: z.string().trim().min(2, "Informe o nome"),
  email: z.email("Informe um e-mail válido").transform((v) => v.toLowerCase()),
  perfil: z.enum(["analitico", "operador", "administrador"]),
});

/*
 * Cria a conta no Auth (senha aleatória, e-mail já confirmado) e o registro do painel.
 * A pessoa define a própria senha por "Esqueci minha senha". Não há auto-cadastro.
 */
export async function criarUsuario(_: EstadoUsuario, form: FormData): Promise<EstadoUsuario> {
  await exigirPerfil("gerir_usuarios");
  const dados = schemaNovo.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0]?.message ?? "Dados inválidos" };

  const admin = criarClienteAdmin();
  const { data, error } = await admin.auth.admin.createUser({
    email: dados.data.email,
    password: crypto.randomUUID(),
    email_confirm: true,
  });
  if (error || !data.user) {
    const msg = error?.message ?? "";
    if (msg.toLowerCase().includes("already")) return { erro: "Já existe uma conta com este e-mail." };
    return { erro: `Não foi possível criar a conta: ${msg}` };
  }

  const { error: erroPainel } = await admin.from("usuarios_painel").insert({
    id: data.user.id,
    email: dados.data.email,
    nome: dados.data.nome,
    perfil: dados.data.perfil,
  });
  if (erroPainel) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { erro: `Não foi possível registrar no painel: ${erroPainel.message}` };
  }

  revalidatePath("/painel/usuarios");
  return { ok: `${dados.data.nome} foi cadastrado. Peça para usar “Esqueci minha senha” no login para definir a senha.` };
}

const schemaAtualizar = z.object({
  id: z.uuid(),
  perfil: z.enum(["analitico", "operador", "administrador"]),
  ativo: z.preprocess((v) => v === "on" || v === "true", z.boolean()),
});

export async function atualizarUsuario(_: EstadoUsuario, form: FormData): Promise<EstadoUsuario> {
  const atual = await exigirPerfil("gerir_usuarios");
  const dados = schemaAtualizar.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: "Dados inválidos" };
  if (dados.data.id === atual.id && (dados.data.perfil !== "administrador" || !dados.data.ativo)) {
    return { erro: "Você não pode rebaixar nem desativar a própria conta." };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase
    .from("usuarios_painel")
    .update({ perfil: dados.data.perfil, ativo: dados.data.ativo })
    .eq("id", dados.data.id);
  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath("/painel/usuarios");
  return { ok: "Usuário atualizado." };
}
