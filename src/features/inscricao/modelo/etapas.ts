import {
  brincadeirasCasal,
  brincadeirasIndividuais,
  brincadeirasPaisFilhos,
  filhosCadastrados,
  idadeNoEvento,
  pessoasComComida,
  pessoasDoDraft,
  temParticipacao,
} from "./regras";
import type { BrincadeiraPublica, EventoPublico, InscricaoDraft, PessoaKey } from "./tipos";

export type TipoEtapa =
  | "boas_vindas"
  | "nome"
  | "apelido"
  | "nascimento"
  | "casado"
  | "conjuge_opcao"
  | "conjuge_dados"
  | "filhos_tem"
  | "filhos_opcao"
  | "filho_dados"
  | "filho_mais"
  | "papel"
  | "comida"
  | "brincadeira"
  | "casal"
  | "pais_filhos"
  | "whatsapp"
  | "resumo";

export interface Etapa {
  id: string;
  tipo: TipoEtapa;
  pessoa?: PessoaKey;
  indice?: number;
  brincadeira?: BrincadeiraPublica;
}

/*
 * A lista de etapas é sempre derivada do rascunho: mudar uma resposta
 * acrescenta ou remove etapas seguintes sem apagar o que já foi respondido.
 */
export function montarEtapas(d: InscricaoDraft, evento: EventoPublico): Etapa[] {
  const etapas: Etapa[] = [];
  const add = (e: Etapa) => etapas.push(e);

  if (evento.boas_vindas) add({ id: "boas_vindas", tipo: "boas_vindas" });
  add({ id: "nome", tipo: "nome" });
  add({ id: "apelido", tipo: "apelido" });
  add({ id: "nascimento", tipo: "nascimento" });

  const idade = idadeNoEvento(d.principal.nascimento, evento);
  if (idade !== null && idade > 18) add({ id: "casado", tipo: "casado" });

  if (idade !== null && idade > 18 && d.principal.casado) {
    add({ id: "conjuge_opcao", tipo: "conjuge_opcao" });
    if (d.conjugeOpcao === "sim") add({ id: "conjuge_dados", tipo: "conjuge_dados", pessoa: "conjuge" });
    add({ id: "filhos_tem", tipo: "filhos_tem" });
    if (d.temFilhosMenores) {
      add({ id: "filhos_opcao", tipo: "filhos_opcao" });
      if (d.filhosOpcao === "sim") {
        const total = Math.max(d.filhos.length, 1);
        for (let i = 0; i < total; i++) {
          add({ id: `filho_dados:${i}`, tipo: "filho_dados", pessoa: `filho:${i}`, indice: i });
          add({ id: `filho_mais:${i}`, tipo: "filho_mais", indice: i });
        }
      }
    }
  }

  if (filhosCadastrados(d) && brincadeirasPaisFilhos(d, evento).length > 0) add({ id: "papel", tipo: "papel" });

  for (const p of pessoasComComida(d, evento)) add({ id: `comida:${p.key}`, tipo: "comida", pessoa: p.key });

  for (const p of pessoasDoDraft(d, evento)) {
    for (const b of brincadeirasIndividuais(p, evento)) {
      add({ id: `brincadeira:${b.id}:${p.key}`, tipo: "brincadeira", pessoa: p.key, brincadeira: b });
    }
  }
  for (const b of brincadeirasCasal(d, evento)) add({ id: `casal:${b.id}`, tipo: "casal", brincadeira: b });
  for (const b of brincadeirasPaisFilhos(d, evento)) add({ id: `pais_filhos:${b.id}`, tipo: "pais_filhos", brincadeira: b });

  if (temParticipacao(d)) add({ id: "whatsapp", tipo: "whatsapp" });
  add({ id: "resumo", tipo: "resumo" });
  return etapas;
}

export function indiceDaEtapa(etapas: Etapa[], id: string): number {
  return etapas.findIndex((e) => e.id === id);
}
