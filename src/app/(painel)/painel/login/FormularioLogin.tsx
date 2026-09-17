"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { entrar, type EstadoAuth } from "../auth/actions";
import styles from "../auth.module.css";

interface Props {
  voltar?: string;
  avisoInicial?: string;
}

export function FormularioLogin({ voltar, avisoInicial }: Props) {
  const [estado, acao] = useActionState<EstadoAuth, FormData>(entrar, {});
  return (
    <form action={acao} className={styles.formulario} noValidate>
      <input type="hidden" name="voltar" value={voltar ?? ""} />
      <CampoTexto id="email" name="email" type="email" rotulo="E-mail" autoComplete="email" inputMode="email" required />
      <CampoTexto id="senha" name="senha" type="password" rotulo="Senha" autoComplete="current-password" required />
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      {!estado.erro && avisoInicial && <Alerta tipo="warning">{avisoInicial}</Alerta>}
      <BotaoEnviar bloco>Entrar</BotaoEnviar>
      <p className={styles.rodape}>
        <Link href="/painel/esqueci-senha" className="rc-link">
          Esqueci minha senha
        </Link>
      </p>
    </form>
  );
}
