"use client";

import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { BotaoEnviar } from "@/components/formulario/BotaoEnviar";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { UploadImagem } from "@/components/upload/UploadImagem";
import type { BrincadeiraPainel } from "@/lib/brincadeiras/consultas";
import { CATEGORIAS, ROTULO_CATEGORIA, UNIDADE_VAGA, type Categoria } from "@/lib/brincadeiras/schema";
import { salvarBrincadeira, type EstadoFormBrincadeira } from "./actions";
import styles from "../../../painel.module.css";

const EditorRico = dynamic(() => import("@/components/editor/EditorRico").then((m) => m.EditorRico), {
  ssr: false,
  loading: () => <p className="rc-hint">Carregando editor…</p>,
});

interface Props {
  eventoId: string;
  brincadeira: BrincadeiraPainel | null;
}

export function FormularioBrincadeira({ eventoId, brincadeira }: Props) {
  const acao = salvarBrincadeira.bind(null, eventoId, brincadeira?.id ?? null);
  const [estado, enviar] = useActionState<EstadoFormBrincadeira, FormData>(acao, {});
  const [categoria, setCategoria] = useState<Categoria>(brincadeira?.categoria ?? "criancas");
  const e = estado.erros ?? {};

  return (
    <form action={enviar} className={styles.formulario} noValidate>
      <section className={styles.secao}>
        <h2>Brincadeira</h2>
        <div className={`${styles.grade} ${styles.grade2}`}>
          <CampoTexto id="nome" name="nome" rotulo="Nome" defaultValue={brincadeira?.nome} erro={e.nome} required />
          <CampoTexto id="limite_participantes" name="limite_participantes" type="number" inputMode="numeric" min={1} rotulo={`Limite (${UNIDADE_VAGA[categoria]})`} ajuda="Ao atingir o limite, a brincadeira some do formulário." defaultValue={brincadeira?.limite_participantes} erro={e.limite_participantes} required />
        </div>
        <fieldset className="rc-fieldset">
          <legend className="rc-legend">Categoria</legend>
          {CATEGORIAS.map((c) => (
            <label key={c} className="rc-choice">
              <input type="radio" name="categoria" value={c} checked={categoria === c} onChange={() => setCategoria(c)} />
              {ROTULO_CATEGORIA[c]}
            </label>
          ))}
          {e.categoria && <p className="rc-error">{e.categoria}</p>}
        </fieldset>
        {categoria !== "casais" && (
          <fieldset className="rc-fieldset">
            <legend className="rc-legend">Formato</legend>
            <label className="rc-choice">
              <input type="radio" name="formato" value="em_grupo" defaultChecked={(brincadeira?.formato ?? "em_grupo") === "em_grupo"} />
              <span>
                Em grupo <span className="rc-choice__hint">Times competindo contra times.</span>
              </span>
            </label>
            <label className="rc-choice">
              <input type="radio" name="formato" value="individual" defaultChecked={brincadeira?.formato === "individual"} />
              <span>
                Individual <span className="rc-choice__hint">Um contra o outro.</span>
              </span>
            </label>
          </fieldset>
        )}
        <label className="rc-choice">
          <input type="checkbox" name="ativo" defaultChecked={brincadeira?.ativo ?? true} />
          <span>
            Ativa <span className="rc-choice__hint">Desative para esconder do formulário sem excluir.</span>
          </span>
        </label>
      </section>

      <section className={styles.secao}>
        <h2>Mídia</h2>
        <UploadImagem name="foto_path" rotulo="Foto" prefixo={`brincadeiras/${eventoId}`} valorInicial={brincadeira?.foto_path} ajuda="JPG, PNG ou WebP. Redimensionada automaticamente." />
        <CampoTexto id="video_url" name="video_url" type="url" inputMode="url" rotulo="Link do vídeo" ajuda="YouTube, Instagram ou qualquer link https." defaultValue={brincadeira?.video_url ?? ""} erro={e.video_url} opcional />
      </section>

      <section className={styles.secao}>
        <h2>Regras</h2>
        <EditorRico id="regras" name="regras" rotulo="Como funciona a brincadeira" valorInicial={brincadeira?.regras} erro={e.regras} />
      </section>

      {estado.erro && <Alerta tipo="danger">{estado.erro}</Alerta>}
      <div className={styles.acoes}>
        <BotaoEnviar>{brincadeira ? "Salvar alterações" : "Criar brincadeira"}</BotaoEnviar>
      </div>
    </form>
  );
}
