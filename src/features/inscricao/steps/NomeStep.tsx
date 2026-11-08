"use client";

import { CircleCheck, Pencil, SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { ContatosOrganizacao } from "@/components/inscricao/ContatosOrganizacao";
import { primeiroNome } from "@/lib/pessoas/nome";
import { useInscricao } from "../estado/InscricaoProvider";
import { useNomeInscrito } from "../estado/useNomeInscrito";
import { limparRascunho } from "../estado/useRascunho";
import { validarNome } from "../modelo/validacoes";
import type { InscricaoDraft } from "../modelo/tipos";
import { AvisoNomeInscrito } from "../ui/AvisoNomeInscrito";
import { StepShell } from "../ui/StepShell";

const ID_CAMPO = "campo-nome";

function escreverNome(d: InscricaoDraft, nome: string): InscricaoDraft {
  // Se o apelido ainda era só a sugestão (primeiro nome), acompanha o nome novo.
  const sugerido = d.principal.apelido === primeiroNome(d.principal.nome);
  const apelido = sugerido ? primeiroNome(nome) : d.principal.apelido;
  return { ...d, principal: { ...d.principal, nome, apelido } };
}

/* Nome do inscrito principal. Se o nome já tem inscrição, mostra o aviso com saída. */
export function NomeStep() {
  const { estado, evento, saida, concluir } = useInscricao();
  const d = estado.draft;
  const [valor, setValor] = useState(d.principal.nome);
  const [erro, setErro] = useState<string>();
  const [homonimo, setHomonimo] = useState(false);
  const { situacao, verificando, verificar, limpar } = useNomeInscrito(d.principal.nome);
  const inscrito = situacao !== "livre";

  async function avancar() {
    if (verificando) return;
    const r = validarNome(valor);
    if (!r.ok) return setErro(r.erro);
    setErro(undefined);
    if ((await verificar(r.valor)) !== "livre") return;
    concluir(escreverNome(d, r.valor));
  }

  function voltarAoCampo(ehHomonimo: boolean) {
    limpar();
    setHomonimo(ehHomonimo);
    document.getElementById(ID_CAMPO)?.focus();
  }

  const nomeDigitado = valor.trim();

  return (
    <StepShell
      titulo="Qual é o seu nome completo?"
      descricao="Como está no seu documento."
      erro={erro}
      mostrarAvancar={!inscrito}
      rotuloAvancar={verificando ? "Verificando…" : "Continuar"}
      onAvancar={avancar}
    >
      <div className="campo-anima">
        <CampoTexto
          id={ID_CAMPO}
          rotulo="Nome completo"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="Nome e sobrenome"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setErro(undefined);
            limpar();
          }}
        />
      </div>

      {inscrito && (
        <AvisoNomeInscrito
          titulo={situacao === "familiar" ? "Um familiar já inscreveu você" : "Você já fez a sua inscrição"}
          acoes={
            <>
              <Link href={`${saida}?quem=${situacao}`} className="rc-btn rc-btn--primary rc-btn--lg rc-btn--block" onClick={() => limparRascunho(evento.id)}>
                <CircleCheck className="rc-icon" aria-hidden="true" /> Está tudo certo, sair
              </Link>
              <button type="button" className="rc-btn rc-btn--secondary rc-btn--block" onClick={() => voltarAoCampo(false)}>
                <Pencil className="rc-icon" aria-hidden="true" /> Corrigir o nome
              </button>
              <button type="button" className="rc-btn rc-btn--block" onClick={() => voltarAoCampo(true)}>
                <SearchX className="rc-icon" aria-hidden="true" /> Não sou essa pessoa
              </button>
            </>
          }
        >
          {situacao === "familiar" ? (
            <p>
              {nomeDigitado} já foi inscrito(a) neste evento por um familiar, com as escolhas de comida e brincadeiras. Não precisa se inscrever de novo.
            </p>
          ) : (
            <p>Já existe uma inscrição com o nome {nomeDigitado} neste evento. Cada pessoa se inscreve uma vez, e depois de confirmada só a organização pode alterar.</p>
          )}
        </AvisoNomeInscrito>
      )}

      {homonimo && !inscrito && (
        <div className="rc-alert campo-anima" role="status">
          <SearchX className="rc-icon" aria-hidden="true" />
          <div>
            <strong className="rc-alert__title">Pode ser alguém com o mesmo nome</strong>
            Escreva o nome completo como está no documento, com todos os sobrenomes, e continue.{" "}
            {evento.contatos.length > 0 ? "Se ainda assim não der certo, fale com a organização:" : "Se ainda assim não der certo, procure a organização do evento."}
          </div>
        </div>
      )}
      {homonimo && !inscrito && <ContatosOrganizacao contatos={evento.contatos} />}
    </StepShell>
  );
}
