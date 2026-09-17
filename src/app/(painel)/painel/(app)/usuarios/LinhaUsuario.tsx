"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { ROTULO_PERFIL, type Perfil } from "@/lib/auth/permissoes";
import { atualizarUsuario, type EstadoUsuario } from "./actions";
import styles from "../painel.module.css";

interface Props {
  usuario: { id: string; nome: string; email: string; perfil: Perfil; ativo: boolean };
  souEu: boolean;
}

export function LinhaUsuario({ usuario, souEu }: Props) {
  const [estado, acao] = useActionState<EstadoUsuario, FormData>(atualizarUsuario, {});
  return (
    <li>
      <form action={acao} className={`rc-card ${styles.secao}`}>
        <input type="hidden" name="id" value={usuario.id} />
        <header className="rc-card__header">
          <h3 className="rc-card__title">
            {usuario.nome} {souEu && <span className="rc-badge rc-badge--roxo">você</span>}
          </h3>
          <span className="rc-hint">{usuario.email}</span>
        </header>
        <div className={`${styles.grade} ${styles.grade2}`}>
          <div className="rc-field">
            <label className="rc-label" htmlFor={`perfil-${usuario.id}`}>
              Perfil
            </label>
            <div className="rc-select">
              <select id={`perfil-${usuario.id}`} name="perfil" className="rc-input" defaultValue={usuario.perfil} disabled={souEu}>
                {(Object.keys(ROTULO_PERFIL) as Perfil[]).map((p) => (
                  <option key={p} value={p}>
                    {ROTULO_PERFIL[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="rc-choice">
            <input type="checkbox" name="ativo" defaultChecked={usuario.ativo} disabled={souEu} />
            Ativo
          </label>
        </div>
        {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
        {estado.ok && <Alerta tipo="success">{estado.ok}</Alerta>}
        {!souEu && (
          <div className={styles.acoes}>
            <BotaoEnviar variante="secondary">Salvar</BotaoEnviar>
          </div>
        )}
      </form>
    </li>
  );
}
