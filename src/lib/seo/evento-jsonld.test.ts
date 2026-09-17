import { describe, expect, it } from "vitest";
import { jsonLdEvento, type EventoParaSeo } from "./evento-jsonld";

const evento: EventoParaSeo = {
  nome: "Recreativa 2027",
  descricao: "Um dia de brincadeiras.",
  data_evento: "2027-02-21",
  hora_inicio: "13:00:00",
  hora_fim: "18:30:00",
  endereco: "Salão comunitário, Iguatemi - PR",
  link_maps: "https://maps.app.goo.gl/x",
  valor_inscricao: 0,
  inscricoes_inicio: "2026-12-01T00:00:00-03:00",
  inscricoes_fim: "2027-02-15T00:00:00-03:00",
  motivo_fechado: null,
};

const opcoes = { url: "https://recreativa.app/", imagem: "https://recreativa.app/marca/og.png" };

describe("jsonLdEvento", () => {
  it("usa o fuso do evento no início e no fim", () => {
    const j = jsonLdEvento(evento, opcoes);
    expect(j.startDate).toBe("2027-02-21T13:00:00-03:00");
    expect(j.endDate).toBe("2027-02-21T18:30:00-03:00");
  });

  it("marca gratuito e inscrições disponíveis", () => {
    const j = jsonLdEvento(evento, opcoes);
    expect(j.isAccessibleForFree).toBe(true);
    expect((j.offers as Record<string, unknown>).availability).toBe("https://schema.org/InStock");
    expect((j.offers as Record<string, unknown>).price).toBe(0);
  });

  it("marca esgotado quando as inscrições estão fechadas", () => {
    const j = jsonLdEvento({ ...evento, motivo_fechado: "limite" }, opcoes);
    expect((j.offers as Record<string, unknown>).availability).toBe("https://schema.org/SoldOut");
  });

  it("informa o valor quando o evento é pago", () => {
    const j = jsonLdEvento({ ...evento, valor_inscricao: 25.5 }, opcoes);
    expect(j.isAccessibleForFree).toBe(false);
    expect((j.offers as Record<string, unknown>).price).toBe(25.5);
  });

  it("omite o período quando a página não carrega essa informação", () => {
    const semPeriodo = { ...evento, inscricoes_inicio: undefined, inscricoes_fim: undefined };
    const oferta = jsonLdEvento(semPeriodo, opcoes).offers as Record<string, unknown>;
    expect(oferta).not.toHaveProperty("validFrom");
    expect(oferta).not.toHaveProperty("validThrough");
  });

  it("omite descrição e imagem quando não existem", () => {
    const j = jsonLdEvento({ ...evento, descricao: null }, { ...opcoes, imagem: null });
    expect(j).not.toHaveProperty("description");
    expect(j).not.toHaveProperty("image");
  });
});
