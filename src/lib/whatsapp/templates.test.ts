import { describe, expect, it } from "vitest";
import { mensagemConfirmacao, mensagemLembrete, mensagemTimes, type EventoMensagem } from "./templates";

const evento: EventoMensagem = {
  nome: "Recreativa 2026",
  data_evento: "2026-11-21",
  hora_inicio: "08:00:00",
  hora_fim: "17:00:00",
  endereco: "Chácara Recanto, Cotia/SP",
  link_maps: "https://maps.app.goo.gl/x",
  valor_inscricao: 0,
  recomendacoes: "Traga *água* e boné.",
};

describe("mensagens de WhatsApp", () => {
  it("confirmação lista a família, comida, brincadeiras e recomendações", () => {
    const texto = mensagemConfirmacao({
      evento,
      principal: { nome: "João da Silva", apelido: "Jota", comida: "Salgado", brincadeiras: [] },
      dependentes: [{ nome: "Pedro da Silva", comida: null, brincadeiras: ["Bíblia ou Bexiga"] }],
    });
    expect(texto).toContain("Olá, João!");
    expect(texto).toContain("*Recreativa 2026*");
    expect(texto).toContain("sábado, 21 de novembro de 2026, das 08:00 às 17:00");
    expect(texto).toContain("• *João da Silva* (Jota)\n  Leva: Salgado");
    expect(texto).toContain("• *Pedro da Silva*\n  Brincadeiras: Bíblia ou Bexiga");
    expect(texto).toContain("*Recomendações importantes:*\nTraga *água* e boné.");
    expect(texto).not.toContain("Valor da inscrição");
  });

  it("aviso de times cobre o próprio, filhos e acompanhados", () => {
    const texto = mensagemTimes({
      evento,
      destinatario: "Rafael",
      proprio: { nome: "Rafael Santos", time: "Leões" },
      filhos: [],
      acompanhados: [{ nome: "Lívia Pereira Dias", time: "Leões" }],
    });
    expect(texto).toContain("• Você (Rafael): *Leões*");
    expect(texto).toContain("• Lívia Pereira Dias (você acompanha nas duplas): *Leões*");
    expect(mensagemTimes({ evento, destinatario: "Ana", proprio: null, filhos: [{ nome: "Théo", time: "Águias" }], acompanhados: [] }, true)).toContain("Houve uma mudança");
  });

  it("lembrete anuncia 1 hora e repete local e times", () => {
    const texto = mensagemLembrete({ evento, destinatario: "Marcos", proprio: null, filhos: [{ nome: "Théo Pereira Dias", time: "Águias" }], acompanhados: [] });
    expect(texto).toContain("começa em 1 hora");
    expect(texto).toContain("📍 Chácara Recanto");
    expect(texto).toContain("• Théo Pereira Dias: *Águias*");
  });
});
