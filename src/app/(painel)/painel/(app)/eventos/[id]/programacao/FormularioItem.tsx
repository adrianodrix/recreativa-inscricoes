"use client";

import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import type { BrincadeiraPainel } from "@/lib/brincadeiras/consultas";
import type { ItemProgramacaoLinha } from "@/lib/pagina-inicial/consultas";
import { salvarItemProgramacao, type EstadoFormItem } from "./actions";
import styles from "../../../painel.module.css";

interface Props {
  eventoId: string;
  item: ItemProgramacaoLinha | null;
  brincadeiras: BrincadeiraPainel[];
}

/* Um momento do dia: horário, o que acontece e se entra no resumo da página inicial. */
export function FormularioItem({ eventoId, item, brincadeiras }: Props) {
  const acao = salvarItemProgramacao.bind(null, eventoId, item?.id ?? null);
  const [estado, enviar] = useActionState<EstadoFormItem, FormData>(acao, {});
  const e = estado.erros ?? {};

  return (
    <form action={enviar} className={styles.formulario} noValidate>
      <section className={styles.secao}>
        <div className={`${styles.grade} ${styles.grade2}`}>
          <CampoTexto id="hora_inicio" name="hora_inicio" type="time" rotulo="Início" defaultValue={item?.hora_inicio.slice(0, 5)} erro={e.hora_inicio} required />
          <CampoTexto id="hora_fim" name="hora_fim" type="time" rotulo="Fim" defaultValue={item?.hora_fim?.slice(0, 5)} erro={e.hora_fim} opcional />
        </div>
        <CampoTexto id="titulo" name="titulo" rotulo="Título" ajuda="Ex.: Caridade, Parada do lanche, Encerramento." defaultValue={item?.titulo} erro={e.titulo} required />
        <CampoTexto id="detalhe" name="detalhe" rotulo="Detalhe" ajuda="Complemento curto. Ex.: casais: Sopro do Amor." defaultValue={item?.detalhe ?? undefined} erro={e.detalhe} opcional />
        <div className="rc-field">
          <label className="rc-label" htmlFor="brincadeira_id">
            Brincadeira <span className="rc-label__optional">(opcional)</span>
          </label>
          <div className="rc-select">
            <select id="brincadeira_id" name="brincadeira_id" className="rc-input" defaultValue={item?.brincadeira_id ?? ""}>
              <option value="">Momento do evento, sem brincadeira</option>
              {brincadeiras.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="rc-choice">
          <input type="checkbox" name="destaque" defaultChecked={item?.destaque ?? false} />
          <span>
            Mostrar no resumo do dia
            <span className="rc-choice__hint">A página inicial resume o dia em até 4 momentos. Sem nenhum marcado, usa os primeiros horários.</span>
          </span>
        </label>
      </section>

      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>{item ? "Salvar alterações" : "Adicionar à programação"}</BotaoEnviar>
      </div>
    </form>
  );
}
