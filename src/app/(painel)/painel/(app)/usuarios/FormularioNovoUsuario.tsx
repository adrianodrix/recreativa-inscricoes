"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { ROTULO_PERFIL, type Perfil } from "@/lib/auth/permissoes";
import { criarUsuario, type EstadoUsuario } from "./actions";
import styles from "../painel.module.css";

const PERFIS: Perfil[] = ["analitico", "operador", "administrador"];

export function FormularioNovoUsuario() {
  const [estado, acao] = useActionState<EstadoUsuario, FormData>(criarUsuario, {});
  return (
    <form action={acao} className={`rc-card ${styles.secao}`} noValidate>
      <h2>Novo usuário</h2>
      <div className={`${styles.grade} ${styles.grade2}`}>
        <CampoTexto id="nome" name="nome" rotulo="Nome" autoComplete="off" required />
        <CampoTexto id="email" name="email" type="email" rotulo="E-mail" inputMode="email" autoComplete="off" required />
      </div>
      <fieldset className="rc-fieldset">
        <legend className="rc-legend">Perfil</legend>
        {PERFIS.map((perfil) => (
          <label key={perfil} className="rc-choice">
            <input type="radio" name="perfil" value={perfil} defaultChecked={perfil === "analitico"} />
            {ROTULO_PERFIL[perfil]}
          </label>
        ))}
      </fieldset>
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      {estado.ok && <Alerta tipo="success">{estado.ok}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>Cadastrar</BotaoEnviar>
      </div>
    </form>
  );
}
