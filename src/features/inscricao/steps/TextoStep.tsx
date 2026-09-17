"use client";

import { useState, type InputHTMLAttributes } from "react";
import type { ZodType } from "zod";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { verificarNome } from "@/app/(publico)/[slug]/actions";
import { useInscricao } from "../estado/InscricaoProvider";
import { formatarWhatsapp, primeiraMensagem, schemaApelido, schemaNome, schemaWhatsapp } from "../modelo/schemas";
import type { InscricaoDraft } from "../modelo/tipos";
import { StepShell } from "../ui/StepShell";

interface Config {
  titulo: string;
  descricao?: string;
  opcional?: boolean;
  schema: ZodType<string, string>;
  ler: (d: InscricaoDraft) => string;
  escrever: (d: InscricaoDraft, v: string) => InscricaoDraft;
  input: InputHTMLAttributes<HTMLInputElement>;
}

const CONFIG = {
  nome: {
    titulo: "Qual é o seu nome completo?",
    descricao: "Como está no seu documento.",
    schema: schemaNome,
    ler: (d) => d.principal.nome,
    escrever: (d, v) => ({ ...d, principal: { ...d.principal, nome: v } }),
    input: { autoComplete: "name", autoCapitalize: "words", placeholder: "Nome e sobrenome" },
  },
  apelido: {
    titulo: "Como você gosta de ser chamado(a)?",
    descricao: "Apelido ou como as pessoas te conhecem. Pode deixar em branco.",
    opcional: true,
    schema: schemaApelido,
    ler: (d) => d.principal.apelido ?? "",
    escrever: (d, v) => ({ ...d, principal: { ...d.principal, apelido: v || undefined } }),
    input: { autoComplete: "nickname", autoCapitalize: "words" },
  },
  whatsapp: {
    titulo: "Qual é o seu WhatsApp?",
    descricao: "Vamos confirmar a inscrição e avisar os times por ele.",
    schema: schemaWhatsapp,
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
    const r = cfg.schema.safeParse(valor);
    if (!r.success) return setErro(primeiraMensagem(r));
    if (tipo === "nome") {
      setVerificando(true);
      const livre = await verificarNome(evento.id, r.data).finally(() => setVerificando(false));
      if (!livre) return setErro("Este nome já está inscrito neste evento. Cada pessoa se inscreve uma vez.");
    }
    setErro(undefined);
    concluir(cfg.escrever(estado.draft, r.data));
  }

  return (
    <StepShell titulo={cfg.titulo} descricao={cfg.descricao} erro={erro} onAvancar={avancar} rotuloAvancar={verificando ? "Verificando…" : "Continuar"}>
      <div className="campo-anima">
        <CampoTexto
          id={`campo-${tipo}`}
          rotulo={cfg.titulo}
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
