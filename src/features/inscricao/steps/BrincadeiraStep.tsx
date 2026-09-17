"use client";

import { Check, X } from "lucide-react";
import { GameCard } from "@/components/inscricao/GameCard";
import { useInscricao } from "../estado/InscricaoProvider";
import type { Etapa } from "../modelo/etapas";
import { pessoaPorKey } from "../modelo/regras";
import type { InscricaoDraft, Participacao } from "../modelo/tipos";
import { StepShell } from "../ui/StepShell";
import styles from "../ui/formulario.module.css";

/* Uma brincadeira por vez para uma pessoa (crianças/jovens) ou para o casal. */
export function BrincadeiraStep({ etapa }: { etapa: Etapa }) {
  const { estado, evento, concluir } = useInscricao();
  const d = estado.draft;
  const b = etapa.brincadeira!;
  const ehCasal = etapa.tipo === "casal";
  const pessoa = etapa.pessoa ? pessoaPorKey(d, evento, etapa.pessoa) : undefined;

  const participa = d.participacoes.some((p) =>
    ehCasal ? "casal" in p && p.brincadeiraId === b.id : "pessoa" in p && p.brincadeiraId === b.id && p.pessoa === etapa.pessoa,
  );

  const titulo = ehCasal
    ? `Vocês topam brincar de ${b.nome}?`
    : `${etapa.pessoa === "principal" ? "Você topa" : `${primeiroNome(pessoa?.nome)} topa`} brincar de ${b.nome}?`;

  function responder(sim: boolean) {
    const semEsta = d.participacoes.filter((p) =>
      ehCasal ? !("casal" in p && p.brincadeiraId === b.id) : !("pessoa" in p && p.brincadeiraId === b.id && p.pessoa === etapa.pessoa),
    );
    const nova: Participacao | null = sim ? (ehCasal ? { brincadeiraId: b.id, casal: true } : { brincadeiraId: b.id, pessoa: etapa.pessoa! }) : null;
    const recusadas = sim ? d.recusadas.filter((r) => r !== etapa.id) : [...new Set([...d.recusadas, etapa.id])];
    const novo: InscricaoDraft = { ...d, participacoes: nova ? [...semEsta, nova] : semEsta, recusadas };
    concluir(novo);
  }

  return (
    <StepShell titulo={titulo} mostrarAvancar={false}>
      <GameCard brincadeira={b} />
      <div className={styles.opcoes}>
        <button type="button" className="rc-btn rc-btn--primary rc-btn--lg" aria-pressed={participa} onClick={() => responder(true)}>
          <Check className="rc-icon" aria-hidden="true" /> {ehCasal ? "Vamos participar" : "Vou participar"}
        </button>
        <button type="button" className="rc-btn rc-btn--secondary" aria-pressed={d.recusadas.includes(etapa.id)} onClick={() => responder(false)}>
          <X className="rc-icon" aria-hidden="true" /> Não, obrigado
        </button>
      </div>
    </StepShell>
  );
}

export function primeiroNome(nome: string | undefined): string {
  return (nome ?? "").trim().split(/\s+/)[0] ?? "";
}
