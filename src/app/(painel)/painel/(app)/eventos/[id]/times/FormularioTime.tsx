"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { UploadImagem } from "@/components/upload/UploadImagem";
import type { TimeLinha } from "@/lib/times/consultas";
import { salvarTime, type EstadoFormTime } from "./actions";
import styles from "../../../painel.module.css";

export function FormularioTime({ eventoId, time }: { eventoId: string; time: TimeLinha | null }) {
  const acao = salvarTime.bind(null, eventoId, time?.id ?? null);
  const [estado, enviar] = useActionState<EstadoFormTime, FormData>(acao, {});
  const e = estado.erros ?? {};
  return (
    <form action={enviar} className={`rc-card ${styles.secao}`} noValidate>
      <h2>{time ? "Editar time" : "Novo time"}</h2>
      <CampoTexto id="nome" name="nome" rotulo="Nome" defaultValue={time?.nome} erro={e.nome} required />
      <UploadImagem name="imagem_path" rotulo="Imagem" prefixo={`times/${eventoId}`} valorInicial={time?.imagem_path} ajuda="Opcional. Sem imagem, usa cor e ícone padrão." />
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar variante={time ? "primary" : "secondary"}>{time ? "Salvar time" : "Cadastrar time"}</BotaoEnviar>
      </div>
    </form>
  );
}
