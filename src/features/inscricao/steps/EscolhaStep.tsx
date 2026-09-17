"use client";

import { ChoiceCards, type Opcao } from "@/components/inscricao/ChoiceCards";
import { ROTULO_COMIDA, TIPOS_COMIDA } from "@/lib/eventos/schema";
import { useInscricao } from "../estado/InscricaoProvider";
import type { Etapa } from "../modelo/etapas";
import { pessoaPorKey } from "../modelo/regras";
import type { InscricaoDraft, OpcaoDependente, TipoComida } from "../modelo/tipos";
import { StepShell } from "../ui/StepShell";

const SIM_NAO: Opcao<"sim" | "nao">[] = [
  { valor: "sim", rotulo: "Sim" },
  { valor: "nao", rotulo: "Não" },
];

const DEPENDENTE = (quem: string): Opcao<OpcaoDependente>[] => [
  { valor: "sim", rotulo: "Sim, cadastrar agora", descricao: `Você informa nome e nascimento ${quem} e já escolhe as brincadeiras.` },
  { valor: "vai_se_cadastrar", rotulo: `${quem === "de cada filho" ? "Eles vão" : "Ele(a) vai"} se inscrever por conta própria` },
  { valor: "nao_cadastrar", rotulo: "Não quero cadastrar" },
];

/* Perguntas de escolha única (sim/não, opções, comida). Avançam ao tocar na opção. */
export function EscolhaStep({ etapa }: { etapa: Etapa }) {
  const { estado, evento, concluir } = useInscricao();
  const d = estado.draft;

  const escolherSimNao = (titulo: string, atual: boolean | undefined, escrever: (d: InscricaoDraft, v: boolean) => InscricaoDraft) => (
    <StepShell titulo={titulo} mostrarAvancar={false}>
      <ChoiceCards nome={etapa.id} opcoes={SIM_NAO} valor={atual === undefined ? undefined : atual ? "sim" : "nao"} aoEscolher={(v) => concluir(escrever(d, v === "sim"))} />
    </StepShell>
  );

  switch (etapa.tipo) {
    case "casado":
      return escolherSimNao("Você é casado(a)?", d.principal.casado, (x, v) => ({ ...x, principal: { ...x.principal, casado: v } }));
    case "filhos_tem":
      return escolherSimNao("Vocês têm filhos menores de 18 anos?", d.temFilhosMenores, (x, v) => ({ ...x, temFilhosMenores: v }));
    case "filho_mais": {
      const i = etapa.indice ?? 0;
      return escolherSimNao("Quer cadastrar mais um filho?", undefined, (x, v) => {
        if (v) return { ...x, filhos: x.filhos.length > i + 1 ? x.filhos : [...x.filhos, { nome: "", nascimento: "" }] };
        const seguintesVazios = x.filhos.slice(i + 1).every((f) => !f.nome && !f.nascimento);
        return seguintesVazios ? { ...x, filhos: x.filhos.slice(0, i + 1) } : x;
      });
    }
    case "conjuge_opcao":
      return (
        <StepShell titulo="Quer cadastrar seu cônjuge agora?" descricao="Cada pessoa só pode ser inscrita uma vez." mostrarAvancar={false}>
          <ChoiceCards nome={etapa.id} opcoes={DEPENDENTE("do seu cônjuge")} valor={d.conjugeOpcao} aoEscolher={(v) => concluir({ ...d, conjugeOpcao: v })} />
        </StepShell>
      );
    case "filhos_opcao":
      return (
        <StepShell titulo="Quer cadastrar os filhos agora?" descricao="Recomendamos que a família decida junta." mostrarAvancar={false}>
          <ChoiceCards nome={etapa.id} opcoes={DEPENDENTE("de cada filho")} valor={d.filhosOpcao} aoEscolher={(v) => concluir({ ...d, filhosOpcao: v, filhos: v === "sim" && d.filhos.length === 0 ? [{ nome: "", nascimento: "" }] : d.filhos })} />
        </StepShell>
      );
    case "papel":
      return (
        <StepShell titulo="Nas brincadeiras de pais e filhos, você é:" mostrarAvancar={false}>
          <ChoiceCards nome={etapa.id} opcoes={[{ valor: "pai", rotulo: "Pai" }, { valor: "mae", rotulo: "Mãe" }]} valor={d.papelPrincipal} aoEscolher={(v) => concluir({ ...d, papelPrincipal: v })} />
        </StepShell>
      );
    case "comida": {
      const key = etapa.pessoa!;
      const pessoa = pessoaPorKey(d, evento, key);
      const nome = key === "principal" ? "você" : (pessoa?.nome ?? "");
      const usados = (tipo: TipoComida) => Object.entries(d.comida).filter(([k, t]) => k !== key && t === tipo).length;
      const opcoes: Opcao<TipoComida>[] = TIPOS_COMIDA.map((tipo) => {
        const restante = evento.comida_disponivel[tipo] - usados(tipo);
        return { valor: tipo, rotulo: ROTULO_COMIDA[tipo], descricao: restante > 0 ? undefined : "Esgotado", desabilitada: restante <= 0 };
      });
      return (
        <StepShell titulo={`O que ${nome} vai levar para compartilhar?`} descricao="Cada pessoa leva uma unidade do tipo escolhido." mostrarAvancar={false}>
          <ChoiceCards nome={etapa.id} opcoes={opcoes} valor={d.comida[key]} aoEscolher={(v) => concluir({ ...d, comida: { ...d.comida, [key]: v } })} />
        </StepShell>
      );
    }
    default:
      return null;
  }
}
