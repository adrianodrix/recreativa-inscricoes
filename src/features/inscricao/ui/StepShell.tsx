"use client";

import { ArrowLeft, ArrowRight, CircleX } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useInscricao } from "../estado/InscricaoProvider";
import styles from "./formulario.module.css";

interface Props {
  titulo: string;
  descricao?: ReactNode;
  erro?: string;
  rotuloAvancar?: string;
  mostrarAvancar?: boolean;
  onAvancar?: () => void;
  children: ReactNode;
}

/* Casca de uma pergunta: título, conteúdo, erro e botões. Enter avança. */
export function StepShell({ titulo, descricao, erro, rotuloAvancar = "Continuar", mostrarAvancar = true, onAvancar, children }: Props) {
  const { indice, etapas, voltar, estado, etapaAtual } = useInscricao();
  const corpo = useRef<HTMLDivElement>(null);
  const erroServidor = estado.errosServidor[etapaAtual.id];
  const mensagemErro = erro ?? erroServidor;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const alvo = corpo.current?.querySelector<HTMLElement>("input, select, textarea, button, [tabindex]");
      alvo?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [etapaAtual.id]);

  return (
    <form
      className={styles.etapa}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onAvancar?.();
      }}
    >
      <header className={styles.cabecalho}>
        <p className={styles.contador} aria-live="polite">
          Pergunta {indice + 1} de {etapas.length}
        </p>
        <h1 className={styles.titulo}>{titulo}</h1>
        {descricao && <div className={styles.descricao}>{descricao}</div>}
      </header>
      <div className={styles.corpo} ref={corpo}>
        {children}
      </div>
      {mensagemErro && (
        <p className="rc-error" role="alert">
          <CircleX className="rc-icon" aria-hidden="true" /> {mensagemErro}
        </p>
      )}
      <footer className={styles.acoes}>
        {indice > 0 && (
          <button type="button" className="rc-btn" onClick={voltar}>
            <ArrowLeft className="rc-icon" aria-hidden="true" /> Voltar
          </button>
        )}
        {mostrarAvancar && (
          <button type="submit" className="rc-btn rc-btn--primary rc-btn--lg">
            {rotuloAvancar} <ArrowRight className="rc-icon" aria-hidden="true" />
          </button>
        )}
      </footer>
    </form>
  );
}
