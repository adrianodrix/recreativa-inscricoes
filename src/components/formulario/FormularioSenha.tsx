"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";

interface EstadoSenha {
  erro?: string;
  ok?: string;
}

interface Props {
  acao: (estado: EstadoSenha, form: FormData) => Promise<EstadoSenha>;
  rotuloBotao?: string;
  className?: string;
}

/* Nova senha + confirmação. Usado em redefinir (via link) e trocar (logado). */
export function FormularioSenha({ acao, rotuloBotao = "Salvar senha", className }: Props) {
  const [estado, enviar] = useActionState<EstadoSenha, FormData>(acao, {});
  return (
    <form action={enviar} className={className} noValidate>
      <CampoTexto
        id="senha"
        name="senha"
        type="password"
        rotulo="Nova senha"
        autoComplete="new-password"
        ajuda="Pelo menos 8 caracteres."
        minLength={8}
        required
      />
      <CampoTexto id="confirmar" name="confirmar" type="password" rotulo="Confirmar nova senha" autoComplete="new-password" required />
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      {estado.ok && <Alerta tipo="success">{estado.ok}</Alerta>}
      <BotaoEnviar bloco>{rotuloBotao}</BotaoEnviar>
    </form>
  );
}
