"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { ROTULO_COMIDA, TIPOS_COMIDA } from "@/lib/eventos/schema";
import type { InscritoResumo } from "@/lib/inscritos/consultas";
import { definirComida, type EstadoInscrito } from "../actions";
import styles from "../../../../painel.module.css";

export function FormularioComida({ eventoId, inscrito }: { eventoId: string; inscrito: InscritoResumo }) {
  const acao = definirComida.bind(null, eventoId, inscrito.id);
  const [estado, enviar] = useActionState<EstadoInscrito, FormData>(acao, {});
  return (
    <form action={enviar} className={`rc-card ${styles.secao}`}>
      <h2>Comida e bebida</h2>
      <div className="rc-field">
        <label className="rc-label" htmlFor="tipo">Vai levar</label>
        <div className="rc-select">
          <select id="tipo" name="tipo" className="rc-input" defaultValue={inscrito.comida ?? ""}>
            <option value="">Nada</option>
            {TIPOS_COMIDA.map((t) => (
              <option key={t} value={t}>
                {ROTULO_COMIDA[t]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      {estado.ok && <Alerta tipo="success">{estado.ok}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar variante="secondary">Salvar comida</BotaoEnviar>
      </div>
    </form>
  );
}
