"use client";

import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { normalizarNome, primeiroNome } from "@/lib/pessoas/nome";
import { useInscricao } from "../estado/InscricaoProvider";
import { useNomeInscrito } from "../estado/useNomeInscrito";
import { removerFilho, seguirSemConjuge, seguirSemFilho } from "../modelo/dependentes";
import type { Etapa } from "../modelo/etapas";
import { idadeNoEvento } from "../modelo/regras";
import { validarNascimento, validarNome } from "../modelo/validacoes";
import type { InscricaoDraft, Pessoa } from "../modelo/tipos";
import { AvisoNomeInscrito } from "../ui/AvisoNomeInscrito";
import { StepShell } from "../ui/StepShell";

const ID_NOME = "campo-pessoa-nome";

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
  const { situacao, verificando, verificar, limpar } = useNomeInscrito(atual.nome);
  const inscrito = situacao !== "livre";

  const titulo = ehFilho ? `Dados do ${indice + 1}º filho` : "Dados do seu cônjuge";

  function nomeRepetidoNoFluxo(valor: string): boolean {
    const n = normalizarNome(valor);
    const outros = [d.principal.nome, ...(ehFilho ? [d.conjuge?.nome ?? ""] : []), ...d.filhos.filter((_, i) => !ehFilho || i !== indice).map((f) => f.nome)];
    return outros.some((o) => o && normalizarNome(o) === n);
  }

  async function avancar() {
    if (verificando) return;
    const rn = validarNome(nome);
    const rd = validarNascimento(nascimento);
    const novos: typeof erros = {};
    if (!rn.ok) novos.nome = rn.erro;
    else if (nomeRepetidoNoFluxo(rn.valor)) novos.nome = "Esse nome já foi usado nesta inscrição.";
    if (!rd.ok) novos.nascimento = rd.erro;
    else if (ehFilho && idade !== null && idade >= 18) novos.nascimento = "Só filhos menores de 18 anos são cadastrados aqui.";
    if (novos.nome || novos.nascimento) return setErros(novos);

    if (!rn.ok || !rd.ok) return;
    setErros({});
    if ((await verificar(rn.valor)) !== "livre") return; // mostra o aviso com as saídas
    const pessoa: Pessoa = { nome: rn.valor, nascimento: rd.valor };
    concluir(ehFilho ? escreverFilho(d, indice, pessoa) : { ...d, conjuge: pessoa });
  }

  function remover() {
    atualizar(removerFilho(d, indice));
    voltar();
  }

  /* Já tem inscrição: tira a pessoa deste cadastro e segue o fluxo. */
  function seguirSem() {
    concluir(ehFilho ? seguirSemFilho(d, indice) : seguirSemConjuge(d));
  }

  function corrigir() {
    limpar();
    document.getElementById(ID_NOME)?.focus();
  }

  return (
    <StepShell titulo={titulo} erro={undefined} mostrarAvancar={!inscrito} rotuloAvancar={verificando ? "Verificando…" : "Continuar"} onAvancar={avancar}>
      <div className="campo-anima" style={{ "--i": 0 } as React.CSSProperties}>
        <CampoTexto
          id={ID_NOME}
          rotulo="Nome completo"
          autoComplete="off"
          autoCapitalize="words"
          value={nome}
          erro={erros.nome}
          onChange={(e) => {
            setNome(e.target.value);
            limpar();
          }}
        />
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
      {inscrito && (
        <AvisoNomeInscrito
          titulo={`${primeiroNome(nome)} já está inscrito(a)`}
          acoes={
            <>
              <button type="button" className="rc-btn rc-btn--primary rc-btn--lg rc-btn--block" onClick={seguirSem}>
                Seguir sem cadastrar <ArrowRight className="rc-icon" aria-hidden="true" />
              </button>
              <button type="button" className="rc-btn rc-btn--secondary rc-btn--block" onClick={corrigir}>
                <Pencil className="rc-icon" aria-hidden="true" /> Corrigir o nome
              </button>
            </>
          }
        >
          <p>
            {situacao === "familiar" ? "Esse nome já foi inscrito neste evento por alguém da família." : "Essa pessoa já fez a própria inscrição neste evento."} Não
            precisa cadastrar de novo.
          </p>
        </AvisoNomeInscrito>
      )}
      {!inscrito && ehFilho && d.filhos.length > 1 && (
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
