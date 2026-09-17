import type { BrincadeiraPublica, EventoPublico, InscricaoDraft } from "./tipos";

const regras = { type: "doc" as const, content: [{ type: "paragraph" as const, content: [{ type: "text" as const, text: "Regras" }] }] };

export function brincadeira(parcial: Partial<BrincadeiraPublica> & Pick<BrincadeiraPublica, "id" | "categoria">): BrincadeiraPublica {
  return {
    nome: `Brincadeira ${parcial.id}`,
    foto_path: null,
    video_url: null,
    regras,
    formato: parcial.categoria === "casais" ? null : "em_grupo",
    vagas_restantes: 10,
    ...parcial,
  };
}

/* Evento em 21/11/2026 com uma brincadeira de cada categoria. */
export function eventoFixture(brincadeiras?: BrincadeiraPublica[]): EventoPublico {
  return {
    id: "e0000000-0000-0000-0000-000000000001",
    nome: "Recreativa 2026",
    slug: "recreativa-2026",
    data_evento: "2026-11-21",
    hora_inicio: "08:00:00",
    hora_fim: "17:00:00",
    endereco: "Chácara",
    link_maps: "https://maps.app.goo.gl/x",
    boas_vindas: null,
    agradecimento: regras,
    recomendacoes: null,
    valor_inscricao: 0,
    motivo_fechado: null,
    comida_disponivel: { salgado: 10, doce: 10, refrigerante: 10, suco: 10 },
    brincadeiras: brincadeiras ?? [
      brincadeira({ id: "a0000000-0000-0000-0000-00000000000a", categoria: "criancas" }),
      brincadeira({ id: "b0000000-0000-0000-0000-00000000000b", categoria: "jovens" }),
      brincadeira({ id: "c0000000-0000-0000-0000-00000000000c", categoria: "casais" }),
      brincadeira({ id: "d0000000-0000-0000-0000-00000000000d", categoria: "pais_e_filhos" }),
    ],
  };
}

export const solteiro35: InscricaoDraft = {
  principal: { nome: "Carlos Alberto Souza", nascimento: "1991-05-05", casado: false },
  filhos: [],
  comida: {},
  recusadas: [],
  participacoes: [],
};

export const familia: InscricaoDraft = {
  principal: { nome: "João da Silva", nascimento: "1985-03-10", apelido: "Jota", casado: true },
  conjugeOpcao: "sim",
  conjuge: { nome: "Maria da Silva", nascimento: "1987-07-01" },
  temFilhosMenores: true,
  filhosOpcao: "sim",
  filhos: [
    { nome: "Pedro da Silva", nascimento: "2021-05-20" },
    { nome: "Ana da Silva", nascimento: "2016-02-02" },
    { nome: "Lucas da Silva", nascimento: "2010-09-09" },
  ],
  papelPrincipal: "pai",
  comida: { principal: "salgado", conjuge: "doce", "filho:2": "suco" },
  recusadas: [],
  participacoes: [],
  whatsapp: "5511999990000",
};
