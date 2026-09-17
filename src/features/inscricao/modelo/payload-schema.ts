import { z } from "zod";
import type { PayloadInscricao } from "./payload";

/* Validação de servidor do contrato da RPC public.criar_inscricao (migration 0007). Só no servidor. */
const pessoa = z.object({
  nome_completo: z.string().min(10),
  data_nascimento: z.iso.date(),
  comida: z.enum(["salgado", "doce", "refrigerante", "suco"]).optional(),
});

const parceiro = z.union([z.enum(["principal", "conjuge"]), z.object({ responsavel_id: z.uuid() })]);

const participacao = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("pessoa"), brincadeira_id: z.uuid(), pessoa: z.string() }),
  z.object({ tipo: z.literal("casal"), brincadeira_id: z.uuid() }),
  z.object({
    tipo: z.literal("dupla"),
    brincadeira_id: z.uuid(),
    filho: z.string(),
    parceiro,
    papel: z.enum(["pai", "mae", "responsavel"]),
  }),
]);

export const schemaPayload = z.object({
  evento_id: z.uuid(),
  principal: pessoa.extend({
    apelido: z.string().max(40).optional(),
    casado: z.boolean(),
    tem_filhos_menores: z.boolean(),
    conjuge_situacao: z.enum(["cadastrado", "vai_se_cadastrar", "nao_quer_cadastrar"]).optional(),
    filhos_situacao: z.enum(["cadastrado", "vai_se_cadastrar", "nao_quer_cadastrar"]).optional(),
    whatsapp: z.string().regex(/^55\d{10,11}$/).optional(),
  }),
  conjuge: pessoa.optional(),
  filhos: z.array(pessoa.extend({ ref: z.string() })).max(20),
  participacoes: z.array(participacao).max(200),
});

/* Garante que o schema e o tipo puro não divirjam. */
export type PayloadValidado = z.infer<typeof schemaPayload>;
const _checagem: PayloadValidado extends PayloadInscricao ? true : never = true;
void _checagem;
