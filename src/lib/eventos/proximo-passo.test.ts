import { describe, expect, it } from "vitest";
import { proximoPasso, type SituacaoEvento } from "./proximo-passo";

const agora = new Date("2026-09-17T12:00:00-03:00");
const base: SituacaoEvento = {
  status: { aberto: true, motivo: null },
  inscricoes_inicio: "2026-09-01T08:00:00-03:00",
  inscricoes_fim: "2026-11-15T23:59:00-03:00",
  data_evento: "2026-11-21",
  times: 0,
  montados: false,
  montagem_status: "rascunho",
  elegiveis: 7,
};

describe("proximoPasso", () => {
  it("conta os dias enquanto as inscrições estão abertas ou ainda não abriram", () => {
    expect(proximoPasso(base, agora)).toBe("Inscrições encerram em 59 dias.");
    expect(proximoPasso({ ...base, inscricoes_fim: "2026-09-18T10:00:00-03:00" }, agora)).toBe("Inscrições encerram amanhã.");
    expect(proximoPasso({ ...base, status: { aberto: false, motivo: "antes_do_periodo" }, inscricoes_inicio: "2026-09-17T20:00:00-03:00" }, agora)).toBe("Inscrições abrem hoje.");
  });

  it("depois de encerradas, guia pela montagem dos times", () => {
    const fechado: SituacaoEvento = { ...base, status: { aberto: false, motivo: "manual" } };
    expect(proximoPasso(fechado, agora)).toBe("Inscrições encerradas: cadastre pelo menos 2 times para montar.");
    expect(proximoPasso({ ...fechado, times: 2 }, agora)).toBe("Inscrições encerradas: monte os times.");
    expect(proximoPasso({ ...fechado, times: 2, montados: true }, agora)).toBe("Times montados: confirme a montagem para avisar as famílias.");
    expect(proximoPasso({ ...fechado, times: 2, montados: true, montagem_status: "confirmado" }, agora)).toBe("Montagem confirmada. Evento em 65 dias.");
    expect(proximoPasso({ ...fechado, elegiveis: 0 }, agora)).toBe("Inscrições encerradas. Sem crianças ou jovens, não há times a montar.");
  });

  it("reconhece o evento já realizado", () => {
    expect(proximoPasso({ ...base, data_evento: "2026-09-16" }, agora)).toBe("Evento realizado.");
  });
});
