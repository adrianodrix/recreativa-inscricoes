"use client";

import { Logo } from "@/components/marca/Logo";
import { InscricaoProvider, useInscricao } from "../estado/InscricaoProvider";
import type { Etapa } from "../modelo/etapas";
import type { ResultadoEnvio } from "../modelo/erros";
import type { PayloadInscricao } from "../modelo/payload";
import type { EventoPublico } from "../modelo/tipos";
import { BoasVindasStep } from "../steps/BoasVindasStep";
import { BrincadeiraStep } from "../steps/BrincadeiraStep";
import { EscolhaStep } from "../steps/EscolhaStep";
import { NascimentoStep } from "../steps/NascimentoStep";
import { PaisFilhosStep } from "../steps/PaisFilhosStep";
import { PessoaStep } from "../steps/PessoaStep";
import { ResumoStep } from "../steps/ResumoStep";
import { TextoStep } from "../steps/TextoStep";
import { BarraProgresso } from "./BarraProgresso";
import { StepTransition } from "./StepTransition";
import styles from "./formulario.module.css";

function EtapaAtual({ etapa }: { etapa: Etapa }) {
  switch (etapa.tipo) {
    case "boas_vindas":
      return <BoasVindasStep />;
    case "nome":
    case "apelido":
    case "whatsapp":
      return <TextoStep tipo={etapa.tipo} />;
    case "nascimento":
      return <NascimentoStep />;
    case "conjuge_dados":
    case "filho_dados":
      return <PessoaStep etapa={etapa} />;
    case "brincadeira":
    case "casal":
      return <BrincadeiraStep etapa={etapa} />;
    case "pais_filhos":
      return <PaisFilhosStep etapa={etapa} />;
    case "resumo":
      return <ResumoStep />;
    default:
      return <EscolhaStep etapa={etapa} />;
  }
}

function Tela() {
  const { evento, etapaAtual, indice, etapas, pronto } = useInscricao();
  return (
    <div className={styles.tela}>
      <header className={styles.topo}>
        <div className={styles.topoLinha}>
          <Logo largura={88} prioridade className={styles.logo} />
          <span className={styles.nomeEvento}>{evento.nome}</span>
        </div>
        <BarraProgresso atual={indice} total={etapas.length} />
      </header>
      <main className={styles.conteudo}>
        {pronto && (
          <StepTransition etapaId={etapaAtual.id}>
            <EtapaAtual key={etapaAtual.id} etapa={etapaAtual} />
          </StepTransition>
        )}
      </main>
    </div>
  );
}

interface Props {
  evento: EventoPublico;
  enviar: (payload: PayloadInscricao) => Promise<ResultadoEnvio>;
  destino: string;
}

export function Formulario({ evento, enviar, destino }: Props) {
  return (
    <InscricaoProvider evento={evento} enviar={enviar} destino={destino}>
      <Tela />
    </InscricaoProvider>
  );
}
