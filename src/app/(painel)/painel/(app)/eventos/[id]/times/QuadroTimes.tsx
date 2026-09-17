"use client";

import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { CircleCheck, RefreshCw, Save, Shuffle } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Alerta } from "@/components/formulario/Alerta";
import { avaliarAlocacao } from "@/lib/times/avaliar";
import type { DadosMontagem, TimeComContagem } from "@/lib/times/consultas";
import type { Alocacao } from "@/lib/times/tipos";
import { confirmarMontagemAction, montarTimesAction, salvarAlocacaoAction } from "./actions";
import { ColunaTime } from "./ColunaTime";
import styles from "./quadro.module.css";

interface Props {
  eventoId: string;
  dados: DadosMontagem;
  times: TimeComContagem[];
  status: "rascunho" | "confirmado";
  inscricoesEncerradas: boolean;
  sementeInicial: number | null;
}

export function QuadroTimes({ eventoId, dados, times, status, inscricoesEncerradas, sementeInicial }: Props) {
  const [alocacao, setAlocacao] = useState<Alocacao>(dados.alocacao);
  const [semente, setSemente] = useState<number>(sementeInicial ?? 0);
  const [sujo, setSujo] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "success" | "danger"; texto: string }>();
  const [pendente, iniciar] = useTransition();
  // Mouse: arrasta após 6px. Toque: segurar 200ms e arrastar (a rolagem continua livre fora da alça). Teclado: Espaço, setas, Espaço.
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const { entrada } = dados;
  const avisos = useMemo(() => avaliarAlocacao(entrada, alocacao), [entrada, alocacao]);
  const vinculadas = useMemo(() => new Set(entrada.vinculos.flatMap((v) => [v.criancaId, v.responsavelId])), [entrada.vinculos]);
  const semTime = entrada.pessoas.filter((p) => !alocacao[p.id]);
  const temAlocacao = Object.keys(alocacao).length > 0;
  const podeConfirmar = inscricoesEncerradas && times.length >= 2 && temAlocacao;

  function mover(pessoaId: string, timeId: string | null) {
    setAlocacao((atual) => {
      const novo = { ...atual };
      if (timeId) novo[pessoaId] = timeId;
      else delete novo[pessoaId];
      return novo;
    });
    setSujo(true);
  }

  function aoSoltar(e: DragEndEvent) {
    if (!e.over) return;
    const destino = String(e.over.id);
    mover(String(e.active.id), destino === "sem-time" ? null : destino);
  }

  function montar(remontar: boolean) {
    if (remontar && sujo && !window.confirm("Remontar descarta as edições manuais não salvas. Continuar?")) return;
    iniciar(async () => {
      const r = await montarTimesAction(eventoId, remontar ? undefined : (sementeInicial ?? undefined));
      if (!r.ok) {
        const e = r.erro;
        const texto =
          e.codigo === "TIMES_INSUFICIENTES" ? "Cadastre pelo menos 2 times."
          : e.codigo === "SEM_ELEGIVEIS" ? "Nenhuma criança ou jovem inscrito ainda."
          : `Conflito: o mesmo responsável está vinculado a irmãos (${e.conflitos.map((c) => c.map((p) => p.nome).join(" e ")).join("; ")}). Troque o responsável de uma das duplas.`;
        setMensagem({ tipo: "danger", texto });
        return;
      }
      setAlocacao(r.alocacao);
      setSemente(r.semente);
      setSujo(true);
      setMensagem({ tipo: "success", texto: `Times montados (semente ${r.semente}). Revise e salve.` });
    });
  }

  function salvar(confirmar: boolean) {
    if (confirmar && !window.confirm("Confirmar a montagem e disparar os avisos por WhatsApp?")) return;
    iniciar(async () => {
      const r = confirmar ? await confirmarMontagemAction(eventoId, alocacao, semente) : await salvarAlocacaoAction(eventoId, alocacao, semente);
      setMensagem(r.ok ? { tipo: "success", texto: r.mensagem } : { tipo: "danger", texto: r.erro });
      if (r.ok) setSujo(false);
    });
  }

  return (
    <div>
      <div className={styles.acoes}>
        <span className={`rc-badge ${status === "confirmado" ? "rc-badge--success" : ""}`}>{status === "confirmado" ? "Confirmada" : "Rascunho"}</span>
        <button type="button" className="rc-btn rc-btn--secondary" disabled={pendente || !inscricoesEncerradas} onClick={() => montar(false)} title={inscricoesEncerradas ? undefined : "Encerre as inscrições para montar"}>
          <Shuffle className="rc-icon" aria-hidden="true" /> Montar
        </button>
        <button type="button" className="rc-btn" disabled={pendente || !inscricoesEncerradas || !temAlocacao} onClick={() => montar(true)}>
          <RefreshCw className="rc-icon" aria-hidden="true" /> Remontar
        </button>
        <button type="button" className="rc-btn" disabled={pendente || !sujo} onClick={() => salvar(false)}>
          <Save className="rc-icon" aria-hidden="true" /> Salvar rascunho
        </button>
        <button type="button" className="rc-btn rc-btn--primary" disabled={pendente || !podeConfirmar} onClick={() => salvar(true)}>
          <CircleCheck className="rc-icon" aria-hidden="true" /> {status === "confirmado" ? "Salvar e reenviar avisos" : "Confirmar montagem"}
        </button>
      </div>
      {!inscricoesEncerradas && <p className="rc-hint">A montagem só é liberada com as inscrições encerradas.</p>}
      {mensagem && <div className={styles.avisos}><Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta></div>}
      {avisos.length > 0 && (
        <div className={styles.avisos}>
          {avisos.map((a, i) => (
            <Alerta key={i} tipo="warning">{a.mensagem}</Alerta>
          ))}
        </div>
      )}
      <DndContext sensors={sensores} onDragEnd={aoSoltar}>
        <div className={styles.quadro}>
          {times.map((t) => (
            <ColunaTime key={t.id} id={t.id} titulo={t.nome} time={t} pessoas={entrada.pessoas.filter((p) => alocacao[p.id] === t.id)} vinculadas={vinculadas} />
          ))}
          <ColunaTime id="sem-time" titulo="Sem time" pessoas={semTime} vinculadas={vinculadas} />
        </div>
      </DndContext>
    </div>
  );
}
