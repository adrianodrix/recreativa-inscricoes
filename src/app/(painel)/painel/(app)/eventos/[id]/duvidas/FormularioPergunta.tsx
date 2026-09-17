"use client";

import dynamic from "next/dynamic";
import { useActionState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import type { PerguntaPainel } from "@/lib/pagina-inicial/consultas";
import { salvarPergunta, type EstadoFormPergunta } from "./actions";
import styles from "../../../painel.module.css";

const EditorRico = dynamic(() => import("@/components/editor/EditorRico").then((m) => m.EditorRico), {
  ssr: false,
  loading: () => <p className="rc-hint">Carregando editor…</p>,
});

interface Props {
  eventoId: string;
  pergunta: PerguntaPainel | null;
}

export function FormularioPergunta({ eventoId, pergunta }: Props) {
  const acao = salvarPergunta.bind(null, eventoId, pergunta?.id ?? null);
  const [estado, enviar] = useActionState<EstadoFormPergunta, FormData>(acao, {});
  const e = estado.erros ?? {};

  return (
    <form action={enviar} className={styles.formulario} noValidate>
      <section className={styles.secao}>
        <CampoTexto
          id="pergunta"
          name="pergunta"
          rotulo="Pergunta"
          ajuda="Escreva como as famílias perguntam. Ex.: Preciso pagar para participar?"
          defaultValue={pergunta?.pergunta}
          erro={e.pergunta}
          required
        />
        <EditorRico id="resposta" name="resposta" rotulo="Resposta" valorInicial={pergunta?.resposta} erro={e.resposta} />
      </section>

      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>{pergunta ? "Salvar alterações" : "Adicionar dúvida"}</BotaoEnviar>
      </div>
    </form>
  );
}
