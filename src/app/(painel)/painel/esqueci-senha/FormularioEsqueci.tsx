"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { esqueciSenha, type EstadoAuth } from "../auth/actions";
import styles from "../auth.module.css";

export function FormularioEsqueci() {
  const [estado, acao] = useActionState<EstadoAuth, FormData>(esqueciSenha, {});
  return (
    <form action={acao} className={styles.formulario} noValidate>
      <CampoTexto
        id="email"
        name="email"
        type="email"
        rotulo="E-mail"
        autoComplete="email"
        inputMode="email"
        ajuda="Enviaremos um link para você definir uma nova senha."
        required
      />
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      {estado.ok && <Alerta tipo="success">{estado.ok}</Alerta>}
      <BotaoEnviar bloco>Enviar link</BotaoEnviar>
      <p className={styles.rodape}>
        <Link href="/painel/login" className="rc-link">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}
