"use client";

import { useState } from "react";
import { buscarResponsaveis } from "@/app/(publico)/[slug]/actions";
import { GameCard } from "@/components/inscricao/GameCard";
import { PersonSearch, type PessoaEncontrada } from "@/components/inscricao/PersonSearch";
import { useInscricao } from "../estado/InscricaoProvider";
import type { Etapa } from "../modelo/etapas";
import { duplaDoFilho, paiMaeDisponivel, papelDe, pessoasDoDraft, responsavelBloqueado } from "../modelo/regras";
import type { InscricaoDraft, Parceiro, PessoaKey } from "../modelo/tipos";
import { StepShell } from "../ui/StepShell";
import { primeiroNome } from "./BrincadeiraStep";

type Escolha = "" | "principal" | "conjuge" | "responsavel";

function escolhaDe(parceiro: Parceiro | undefined): Escolha {
  if (!parceiro) return "";
  return parceiro.tipo === "pai_mae" ? parceiro.pessoa : "responsavel";
}

/* Brincadeira de pais e filhos: para cada filho, quem forma a dupla. */
export function PaisFilhosStep({ etapa }: { etapa: Etapa }) {
  const { estado, evento, concluir } = useInscricao();
  const b = etapa.brincadeira!;
  const [draft, setDraft] = useState<InscricaoDraft>(estado.draft);
  const [erro, setErro] = useState<string>();
  const [pendentes, setPendentes] = useState<Record<string, boolean>>({});
  const filhos = pessoasDoDraft(draft, evento).filter((p) => p.vinculo === "filho");
  const conjuge = draft.conjuge?.nome;

  function definir(filho: PessoaKey, parceiro: Parceiro | null) {
    const outras = draft.participacoes.filter((p) => !("filho" in p && p.brincadeiraId === b.id && p.filho === filho));
    setDraft({ ...draft, participacoes: parceiro ? [...outras, { brincadeiraId: b.id, filho, parceiro }] : outras });
    setErro(undefined);
  }

  function escolher(filho: PessoaKey, escolha: Escolha) {
    setPendentes((p) => ({ ...p, [filho]: escolha === "responsavel" }));
    if (escolha === "") return definir(filho, null);
    if (escolha === "responsavel") return definir(filho, null);
    definir(filho, { tipo: "pai_mae", pessoa: escolha, papel: papelDe(draft, escolha) });
  }

  function escolherResponsavel(filho: PessoaKey, p: PessoaEncontrada) {
    setPendentes((x) => ({ ...x, [filho]: false }));
    definir(filho, { tipo: "responsavel", inscritoId: p.id, nome: p.nome_completo, apelido: p.apelido });
  }

  function avancar() {
    if (Object.values(pendentes).some(Boolean)) return setErro("Escolha o responsável ou mude a opção.");
    const duplas = draft.participacoes.filter((p) => "filho" in p && p.brincadeiraId === b.id).length;
    if (duplas > b.vagas_restantes) return setErro(`Só restam ${b.vagas_restantes} duplas nesta brincadeira.`);
    concluir(draft);
  }

  return (
    <StepShell titulo={`${b.nome}: quem forma dupla?`} descricao="Cada adulto ou responsável acompanha um filho por vez. Quem não for participar, deixe em branco." erro={erro} onAvancar={avancar}>
      <GameCard brincadeira={b} />
      {filhos.map((filho, i) => {
        const atual = duplaDoFilho(draft, b.id, filho.key);
        const escolha = pendentes[filho.key] ? "responsavel" : escolhaDe(atual);
        const bloqueados = draft.participacoes
          .filter((p) => "filho" in p && p.parceiro.tipo === "responsavel")
          .map((p) => ("filho" in p && p.parceiro.tipo === "responsavel" ? p.parceiro.inscritoId : ""))
          .filter((id) => id && responsavelBloqueado(draft, id, filho.key));
        return (
          <div key={filho.key} className="rc-field campo-anima" style={{ "--i": i } as React.CSSProperties}>
            <label className="rc-label" htmlFor={`dupla-${filho.key}`}>
              Quem brinca com {primeiroNome(filho.nome)} ({filho.idade} anos)?
            </label>
            <div className="rc-select">
              <select id={`dupla-${filho.key}`} className="rc-input" value={escolha} onChange={(e) => escolher(filho.key, e.target.value as Escolha)}>
                <option value="">Não vai participar</option>
                {paiMaeDisponivel(draft, b.id, filho.key, "principal") && <option value="principal">Eu ({papelDe(draft, "principal") === "pai" ? "pai" : "mãe"})</option>}
                {conjuge && paiMaeDisponivel(draft, b.id, filho.key, "conjuge") && <option value="conjuge">{primeiroNome(conjuge)} ({papelDe(draft, "conjuge") === "pai" ? "pai" : "mãe"})</option>}
                <option value="responsavel">Outro responsável (jovem já inscrito)</option>
              </select>
            </div>
            {atual?.tipo === "responsavel" && !pendentes[filho.key] && (
              <p className="rc-hint">
                Responsável: <strong>{atual.nome}</strong>
                {atual.apelido ? ` (${atual.apelido})` : ""}.{" "}
                <button type="button" className="rc-link" onClick={() => escolher(filho.key, "responsavel")} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
                  Trocar
                </button>
              </p>
            )}
            {pendentes[filho.key] && (
              <PersonSearch buscar={(termo) => buscarResponsaveis(evento.id, b.id, termo)} bloqueados={bloqueados} aoEscolher={(p) => escolherResponsavel(filho.key, p)} />
            )}
          </div>
        );
      })}
    </StepShell>
  );
}
