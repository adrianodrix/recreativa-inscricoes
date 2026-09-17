import { describe, expect, it } from "vitest";
import { schemaContato, schemaItemProgramacao, schemaPergunta } from "./schema";

const doc = JSON.stringify({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Não" }] }] });

const item = {
  hora_inicio: "13:00",
  hora_fim: "",
  titulo: "Caridade",
  detalhe: "",
  brincadeira_id: "",
  destaque: "off",
};

describe("schemaItemProgramacao", () => {
  it("aceita item sem fim, sem detalhe e sem brincadeira", () => {
    const r = schemaItemProgramacao.parse(item);
    expect(r).toMatchObject({ hora_fim: null, detalhe: null, brincadeira_id: null, destaque: false });
  });

  it("recusa fim antes ou igual ao início", () => {
    expect(schemaItemProgramacao.safeParse({ ...item, hora_fim: "12:00" }).success).toBe(false);
    expect(schemaItemProgramacao.safeParse({ ...item, hora_fim: "13:00" }).success).toBe(false);
    expect(schemaItemProgramacao.safeParse({ ...item, hora_fim: "14:00" }).success).toBe(true);
  });

  it("marca destaque pela caixa marcada", () => {
    expect(schemaItemProgramacao.parse({ ...item, destaque: "on" }).destaque).toBe(true);
  });

  it("exige título", () => {
    expect(schemaItemProgramacao.safeParse({ ...item, titulo: "a" }).success).toBe(false);
  });
});

describe("schemaPergunta", () => {
  it("exige pergunta e resposta", () => {
    expect(schemaPergunta.safeParse({ pergunta: "Preciso pagar?", resposta: doc }).success).toBe(true);
    expect(schemaPergunta.safeParse({ pergunta: "Preciso pagar?", resposta: "" }).success).toBe(false);
    expect(schemaPergunta.safeParse({ pergunta: "oi", resposta: doc }).success).toBe(false);
  });
});

describe("schemaContato", () => {
  it("guarda o telefone no formato do banco", () => {
    expect(schemaContato.parse({ nome: "Moisés", whatsapp: "(44) 99956-1856" }).whatsapp).toBe("5544999561856");
    expect(schemaContato.parse({ nome: "Moisés", whatsapp: "+55 44 99956-1856" }).whatsapp).toBe("5544999561856");
  });

  it("recusa telefone incompleto", () => {
    expect(schemaContato.safeParse({ nome: "Moisés", whatsapp: "99956" }).success).toBe(false);
  });
});
