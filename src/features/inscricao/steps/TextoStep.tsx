"use client";

import { useState, type InputHTMLAttributes } from "react";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { verificarNome } from "@/app/(publico)/[slug]/actions";
import { useInscricao } from "../estado/InscricaoProvider";
import { formatarWhatsapp, validarApelido, validarNome, validarWhatsapp, type Validado } from "../modelo/validacoes";
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

const CONFIG = {
  nome: {
    titulo: "Qual é o seu nome completo?",
    rotulo: "Nome completo",
    descricao: "Como está no seu documento.",
    validar: validarNome,
    ler: (d) => d.principal.nome,
    escrever: (d, v) => ({ ...d, principal: { ...d.principal, nome: v } }),
    input: { autoComplete: "name", autoCapitalize: "words", placeholder: "Nome e sobrenome" },
  },
  apelido: {
    titulo: "Como você gosta de ser chamado(a)?",
    rotulo: "Apelido",
    descricao: "Apelido ou como as pessoas te conhecem. Pode deixar em branco.",
    opcional: true,
    validar: validarApelido,
    ler: (d) => d.principal.apelido ?? "",
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
  const { estado, evento, concluir } = useInscricao();
  const [valor, setValor] = useState(() => cfg.ler(estado.draft));
  const [erro, setErro] = useState<string>();
  const [verificando, setVerificando] = useState(false);

  async function avancar() {
    const r = cfg.validar(valor);
    if (!r.ok) return setErro(r.erro);
    if (tipo === "nome") {
      setVerificando(true);
      const livre = await verificarNome(evento.id, r.valor).finally(() => setVerificando(false));
      if (!livre) return setErro("Este nome já está inscrito neste evento. Cada pessoa se inscreve uma vez.");
    }
    setErro(undefined);
    concluir(cfg.escrever(estado.draft, r.valor));
  }

  return (
    <StepShell titulo={cfg.titulo} descricao={cfg.descricao} erro={erro} onAvancar={avancar} rotuloAvancar={verificando ? "Verificando…" : "Continuar"}>
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
