"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { verificarNome } from "@/app/(publico)/[slug]/actions";
import { normalizarNome } from "@/lib/pessoas/nome";
import { useInscricao } from "../estado/InscricaoProvider";
import type { Etapa } from "../modelo/etapas";
import { idadeNoEvento } from "../modelo/regras";
import { validarNascimento, validarNome } from "../modelo/validacoes";
import type { InscricaoDraft, Pessoa } from "../modelo/tipos";
import { StepShell } from "../ui/StepShell";

/* Cônjuge ou filho: nome e nascimento na mesma tela. */
export function PessoaStep({ etapa }: { etapa: Etapa }) {
  const { estado, evento, concluir, atualizar, voltar } = useInscricao();
  const d = estado.draft;
  const ehFilho = etapa.tipo === "filho_dados";
  const indice = etapa.indice ?? 0;
  const atual: Pessoa = (ehFilho ? d.filhos[indice] : d.conjuge) ?? { nome: "", nascimento: "" };
  const [nome, setNome] = useState(atual.nome);
  const [nascimento, setNascimento] = useState(atual.nascimento);
  const [erros, setErros] = useState<{ nome?: string; nascimento?: string }>({});
  const idade = idadeNoEvento(nascimento, evento);

  const titulo = ehFilho ? `Dados do ${indice + 1}º filho` : "Dados do seu cônjuge";

  function nomeRepetidoNoFluxo(valor: string): boolean {
    const n = normalizarNome(valor);
    const outros = [d.principal.nome, ...(ehFilho ? [d.conjuge?.nome ?? ""] : []), ...d.filhos.filter((_, i) => !ehFilho || i !== indice).map((f) => f.nome)];
    return outros.some((o) => o && normalizarNome(o) === n);
  }

  async function avancar() {
    const rn = validarNome(nome);
    const rd = validarNascimento(nascimento);
    const novos: typeof erros = {};
    if (!rn.ok) novos.nome = rn.erro;
    else if (nomeRepetidoNoFluxo(rn.valor)) novos.nome = "Esse nome já foi usado nesta inscrição.";
    else if (!(await verificarNome(evento.id, rn.valor))) novos.nome = "Este nome já está inscrito neste evento.";
    if (!rd.ok) novos.nascimento = rd.erro;
    else if (ehFilho && idade !== null && idade >= 18) novos.nascimento = "Só filhos menores de 18 anos são cadastrados aqui.";
    if (novos.nome || novos.nascimento) return setErros(novos);

    if (!rn.ok || !rd.ok) return;
    const pessoa: Pessoa = { nome: rn.valor, nascimento: rd.valor };
    concluir(ehFilho ? escreverFilho(d, indice, pessoa) : { ...d, conjuge: pessoa });
  }

  function remover() {
    atualizar({ ...d, filhos: d.filhos.filter((_, i) => i !== indice) });
    voltar();
  }

  return (
    <StepShell titulo={titulo} erro={undefined} onAvancar={avancar}>
      <div className="campo-anima" style={{ "--i": 0 } as React.CSSProperties}>
        <CampoTexto id="campo-pessoa-nome" rotulo="Nome completo" autoComplete="off" autoCapitalize="words" value={nome} erro={erros.nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="campo-anima" style={{ "--i": 1 } as React.CSSProperties}>
        <CampoTexto
          id="campo-pessoa-nascimento"
          type="date"
          rotulo="Data de nascimento"
          min="1900-01-01"
          max={new Date().toISOString().slice(0, 10)}
          value={nascimento}
          erro={erros.nascimento}
          ajuda={idade !== null ? `Terá ${idade} ano${idade === 1 ? "" : "s"} no dia do evento.` : undefined}
          onChange={(e) => setNascimento(e.target.value)}
        />
      </div>
      {ehFilho && d.filhos.length > 1 && (
        <button type="button" className="rc-btn rc-btn--sm" onClick={remover}>
          <Trash2 className="rc-icon" aria-hidden="true" /> Remover este filho
        </button>
      )}
    </StepShell>
  );
}

function escreverFilho(d: InscricaoDraft, indice: number, pessoa: Pessoa): InscricaoDraft {
  const filhos = [...d.filhos];
  filhos[indice] = pessoa;
  return { ...d, filhos };
}
