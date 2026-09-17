"use client";

import dynamic from "next/dynamic";
import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { UploadImagem } from "@/components/upload/UploadImagem";
import { isoParaLocal } from "@/lib/datas";
import type { EventoCompleto } from "@/lib/eventos/consultas";
import { ROTULO_COMIDA, TIPOS_COMIDA } from "@/lib/eventos/schema";
import { salvarEvento, type EstadoFormEvento } from "./actions";
import styles from "../painel.module.css";

const EditorRico = dynamic(() => import("@/components/editor/EditorRico").then((m) => m.EditorRico), {
  ssr: false,
  loading: () => <p className="rc-hint">Carregando editor…</p>,
});

interface Props {
  evento: EventoCompleto | null;
}

export function FormularioEvento({ evento }: Props) {
  const acao = salvarEvento.bind(null, evento?.id ?? null);
  const [estado, enviar] = useActionState<EstadoFormEvento, FormData>(acao, {});
  const e = estado.erros ?? {};

  return (
    <form action={enviar} className={styles.formulario} noValidate>
      <section className={styles.secao}>
        <h2>Evento</h2>
        <div className={`${styles.grade} ${styles.grade2}`}>
          <CampoTexto id="nome" name="nome" rotulo="Nome" defaultValue={evento?.nome} erro={e.nome} required />
          <CampoTexto
            id="slug"
            name="slug"
            rotulo="Link público"
            ajuda="Deixe em branco para gerar a partir do nome. Ex.: recreativa-2026"
            defaultValue={evento?.slug}
            erro={e.slug}
            opcional
          />
          <CampoTexto id="data_evento" name="data_evento" type="date" rotulo="Data" defaultValue={evento?.data_evento} erro={e.data_evento} required />
          <div className={`${styles.grade} ${styles.grade2}`}>
            <CampoTexto id="hora_inicio" name="hora_inicio" type="time" rotulo="Início" defaultValue={evento?.hora_inicio.slice(0, 5)} erro={e.hora_inicio} required />
            <CampoTexto id="hora_fim" name="hora_fim" type="time" rotulo="Fim" defaultValue={evento?.hora_fim.slice(0, 5)} erro={e.hora_fim} required />
          </div>
          <CampoTexto id="endereco" name="endereco" rotulo="Endereço" defaultValue={evento?.endereco} erro={e.endereco} required />
          <CampoTexto id="link_maps" name="link_maps" type="url" rotulo="Link do Google Maps" inputMode="url" defaultValue={evento?.link_maps} erro={e.link_maps} required />
        </div>
      </section>

      <section className={styles.secao}>
        <h2>Inscrições</h2>
        <div className={`${styles.grade} ${styles.grade2}`}>
          <CampoTexto id="inscricoes_inicio" name="inscricoes_inicio" type="datetime-local" rotulo="Abertura" defaultValue={evento ? isoParaLocal(evento.inscricoes_inicio) : undefined} erro={e.inscricoes_inicio} required />
          <CampoTexto id="inscricoes_fim" name="inscricoes_fim" type="datetime-local" rotulo="Encerramento" defaultValue={evento ? isoParaLocal(evento.inscricoes_fim) : undefined} erro={e.inscricoes_fim} required />
          <CampoTexto id="limite_inscritos" name="limite_inscritos" type="number" inputMode="numeric" min={1} rotulo="Limite de inscritos" ajuda="Conta todas as pessoas, incluindo cônjuge e filhos." defaultValue={evento?.limite_inscritos} erro={e.limite_inscritos} required />
          <CampoTexto id="valor_inscricao" name="valor_inscricao" inputMode="decimal" rotulo="Valor da inscrição (R$)" ajuda="0 = gratuito. Somente informativo." defaultValue={evento ? String(evento.valor_inscricao).replace(".", ",") : "0"} erro={e.valor_inscricao} />
        </div>
        <label className="rc-choice">
          <input type="checkbox" name="aberto_manual" defaultChecked={evento?.aberto_manual ?? true} />
          <span>
            Inscrições liberadas pelo organizador
            <span className="rc-choice__hint">Desmarque para encerrar manualmente, mesmo dentro do período.</span>
          </span>
        </label>
      </section>

      <section className={styles.secao}>
        <h2>Comida e bebida</h2>
        <p className="rc-hint">Quantidade máxima de pessoas que podem escolher cada tipo. Cada inscrito leva uma unidade.</p>
        <div className={`${styles.grade} ${styles.grade4}`}>
          {TIPOS_COMIDA.map((tipo) => (
            <CampoTexto key={tipo} id={`limite_${tipo}`} name={`limite_${tipo}`} type="number" inputMode="numeric" min={0} rotulo={ROTULO_COMIDA[tipo]} defaultValue={evento?.limites[tipo] ?? 0} erro={e[`limite_${tipo}`]} required />
          ))}
        </div>
      </section>

      <section className={styles.secao}>
        <h2>Capa</h2>
        <UploadImagem name="capa_path" rotulo="Imagem de capa" prefixo={`capas/${evento?.id ?? "novo"}`} valorInicial={evento?.capa_path} ajuda="Opcional. Aparece no topo do formulário." />
      </section>

      <section className={styles.secao}>
        <h2>Textos</h2>
        <EditorRico id="boas_vindas" name="boas_vindas" rotulo="Boas-vindas" ajuda="Aparece na primeira tela do formulário." valorInicial={evento?.boas_vindas} erro={e.boas_vindas} opcional />
        <EditorRico id="agradecimento" name="agradecimento" rotulo="Agradecimento" ajuda="Página final, após confirmar a inscrição." valorInicial={evento?.agradecimento} erro={e.agradecimento} />
        <EditorRico id="recomendacoes" name="recomendacoes" rotulo="Recomendações importantes" ajuda="Aparece abaixo do agradecimento e na mensagem de WhatsApp." valorInicial={evento?.recomendacoes} erro={e.recomendacoes} opcional />
      </section>

      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>{evento ? "Salvar alterações" : "Criar evento"}</BotaoEnviar>
      </div>
    </form>
  );
}
