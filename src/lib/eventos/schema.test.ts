import { describe, expect, it } from "vitest";
import { errosPorCampo, schemaEvento } from "./schema";

const agradecimento = JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Obrigado!" }] }] });
const vazio = JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });

const base = {
  nome: "Recreativa 2026",
  slug: "",
  data_evento: "2026-11-15",
  hora_inicio: "08:00",
  hora_fim: "17:00",
  endereco: "Rua das Flores, 100",
  link_maps: "https://maps.app.goo.gl/abc",
  inscricoes_inicio: "2026-09-01T08:00",
  inscricoes_fim: "2026-11-10T23:59",
  aberto_manual: "on",
  limite_inscritos: "200",
  valor_inscricao: "0",
  limite_salgado: "100",
  limite_doce: "80",
  limite_refrigerante: "50",
  limite_suco: "50",
  boas_vindas: "",
  agradecimento,
  recomendacoes: vazio,
};

describe("schemaEvento", () => {
  it("aceita o formulário completo, gera o slug e converte tipos", () => {
    const r = schemaEvento.safeParse(base);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.slug).toBe("recreativa-2026");
    expect(r.data.inscricoes_inicio).toBe("2026-09-01T08:00:00-03:00");
    expect(r.data.aberto_manual).toBe(true);
    expect(r.data.limite_inscritos).toBe(200);
    expect(r.data.valor_inscricao).toBe(0);
    expect(r.data.boas_vindas).toBeNull();
    expect(r.data.recomendacoes).toBeNull();
    expect(r.data.agradecimento?.type).toBe("doc");
  });

  it("converte valor em reais no formato brasileiro", () => {
    const r = schemaEvento.safeParse({ ...base, valor_inscricao: "1.250,50" });
    expect(r.success && r.data.valor_inscricao).toBe(1250.5);
  });

  it("aponta erros por campo", () => {
    const r = schemaEvento.safeParse({ ...base, hora_fim: "07:00", agradecimento: vazio, slug: "painel", link_maps: "http://x.com" });
    expect(r.success).toBe(false);
    if (r.success) return;
    const erros = errosPorCampo(r.error);
    expect(erros.hora_fim).toBe("O fim deve ser depois do início");
    expect(erros.agradecimento).toBe("Preencha este texto");
    expect(erros.slug).toBe("Link inválido ou reservado");
    expect(erros.link_maps).toBeTruthy();
  });
});
