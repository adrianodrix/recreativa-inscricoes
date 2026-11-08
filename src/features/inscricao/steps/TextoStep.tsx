"use client";

import { useState, type InputHTMLAttributes } from "react";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { primeiroNome } from "@/lib/pessoas/nome";
import { useInscricao } from "../estado/InscricaoProvider";
import { formatarWhatsapp, validarApelido, validarWhatsapp, type Validado } from "../modelo/validacoes";
import type { InscricaoDraft } from "../modelo/tipos";
import { StepShell } from "../ui/StepShell";

interface Config {
  titulo: string;
  rotulo: string;
  descricao?: string;
  opcional?: boolean;
  validar: (v: string) => Validado<string>;
  ler: (d: InscricaoDraft) => string;
  escrever: (d: InscricaoDraft, v: string) => InscricaoDraft;
  input: InputHTMLAttributes<HTMLInputElement>;
}

/* Perguntas de texto simples. O nome tem etapa própria (NomeStep), por causa da checagem de inscrição. */
const CONFIG = {
  apelido: {
    titulo: "Como você gosta de ser chamado(a)?",
    rotulo: "Apelido",
    descricao: "Sugerimos o seu primeiro nome. Troque pelo apelido, se preferir, ou deixe em branco.",
    opcional: true,
    validar: validarApelido,
    ler: (d) => d.principal.apelido ?? primeiroNome(d.principal.nome),
    escrever: (d, v) => ({ ...d, principal: { ...d.principal, apelido: v || undefined } }),
    input: { autoComplete: "nickname", autoCapitalize: "words" },
  },
  whatsapp: {
    titulo: "Qual é o seu WhatsApp?",
    rotulo: "WhatsApp",
    descricao: "Vamos confirmar a inscrição e avisar os times por ele.",
    validar: validarWhatsapp,
    ler: (d) => (d.whatsapp ? formatarWhatsapp(d.whatsapp) : ""),
    escrever: (d, v) => ({ ...d, whatsapp: v }),
    input: { type: "tel", inputMode: "tel", autoComplete: "tel-national", placeholder: "(11) 99999-9999" },
  },
} satisfies Record<string, Config>;

export function TextoStep({ tipo }: { tipo: keyof typeof CONFIG }) {
  const cfg: Config = CONFIG[tipo];
  const { estado, concluir } = useInscricao();
  const [valor, setValor] = useState(() => cfg.ler(estado.draft));
  const [erro, setErro] = useState<string>();

  function avancar() {
    const r = cfg.validar(valor);
    if (!r.ok) return setErro(r.erro);
    setErro(undefined);
    concluir(cfg.escrever(estado.draft, r.valor));
  }

  return (
    <StepShell titulo={cfg.titulo} descricao={cfg.descricao} erro={erro} onAvancar={avancar}>
      <div className="campo-anima">
        <CampoTexto
          id={`campo-${tipo}`}
          rotulo={cfg.rotulo}
          opcional={cfg.opcional}
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            setErro(undefined);
          }}
          {...cfg.input}
        />
      </div>
    </StepShell>
  );
}
