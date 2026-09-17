"use client";

import { useState } from "react";
import { CampoTexto } from "@/components/formulario/CampoTexto";
import { useInscricao } from "../estado/InscricaoProvider";
import { idadeNoEvento } from "../modelo/regras";
import { primeiraMensagem, schemaNascimento } from "../modelo/schemas";
import { StepShell } from "../ui/StepShell";

export function NascimentoStep() {
  const { estado, evento, concluir } = useInscricao();
  const [valor, setValor] = useState(estado.draft.principal.nascimento);
  const [erro, setErro] = useState<string>();
  const idade = idadeNoEvento(valor, evento);

  function avancar() {
    const r = schemaNascimento.safeParse(valor);
    if (!r.success) return setErro(primeiraMensagem(r));
    setErro(undefined);
    concluir({ ...estado.draft, principal: { ...estado.draft.principal, nascimento: r.data } });
  }

  return (
    <StepShell titulo="Qual é a sua data de nascimento?" descricao="Usamos a idade no dia do evento para montar as brincadeiras." erro={erro} onAvancar={avancar}>
      <div className="campo-anima">
        <CampoTexto
          id="campo-nascimento"
          type="date"
          rotulo="Data de nascimento"
          autoComplete="bday"
          min="1900-01-01"
          max={new Date().toISOString().slice(0, 10)}
          value={valor}
          ajuda={idade !== null ? `No dia do evento você terá ${idade} ano${idade === 1 ? "" : "s"}.` : undefined}
          onChange={(e) => {
            setValor(e.target.value);
            setErro(undefined);
          }}
        />
      </div>
    </StepShell>
  );
}
