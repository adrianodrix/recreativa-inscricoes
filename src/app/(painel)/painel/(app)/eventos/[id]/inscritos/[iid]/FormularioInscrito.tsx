"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { formatarWhatsapp } from "@/features/inscricao/modelo/schemas";
import type { InscritoResumo } from "@/lib/inscritos/consultas";
import { atualizarInscrito, type EstadoInscrito } from "../actions";
import styles from "../../../../painel.module.css";

export function FormularioInscrito({ eventoId, inscrito }: { eventoId: string; inscrito: InscritoResumo }) {
  const acao = atualizarInscrito.bind(null, eventoId, inscrito.id);
  const [estado, enviar] = useActionState<EstadoInscrito, FormData>(acao, {});
  const e = estado.erros ?? {};
  return (
    <form action={enviar} className={`rc-card ${styles.secao}`} noValidate>
      <h2>Dados</h2>
      <div className={`${styles.grade} ${styles.grade2}`}>
        <CampoTexto id="nome_completo" name="nome_completo" rotulo="Nome completo" defaultValue={inscrito.nome_completo} erro={e.nome_completo} required />
        <CampoTexto id="apelido" name="apelido" rotulo="Apelido" defaultValue={inscrito.apelido ?? ""} erro={e.apelido} opcional />
        <CampoTexto id="data_nascimento" name="data_nascimento" type="date" rotulo="Data de nascimento" defaultValue={inscrito.data_nascimento} erro={e.data_nascimento} ajuda="A idade no evento é recalculada ao salvar." required />
        {inscrito.vinculo === "principal" && (
          <CampoTexto id="whatsapp" name="whatsapp" type="tel" inputMode="tel" rotulo="WhatsApp" defaultValue={inscrito.whatsapp ? formatarWhatsapp(inscrito.whatsapp) : ""} erro={e.whatsapp} opcional />
        )}
      </div>
      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      {estado.ok && <Alerta tipo="success">{estado.ok}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>Salvar dados</BotaoEnviar>
      </div>
    </form>
  );
}
