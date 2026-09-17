import type { Etapa } from "./etapas";
import { keyDeRef } from "./payload";

/* Erro devolvido pela RPC criar_inscricao: message = código, detail = JSON. */
export interface ErroInscricao {
  codigo: string;
  detalhe: Record<string, unknown>;
}

const MENSAGENS: Record<string, string> = {
  inscricoes_fechadas: "As inscrições foram encerradas antes de você concluir.",
  limite_evento: "O limite de inscritos do evento foi atingido.",
  nome_duplicado: "Este nome já está inscrito neste evento.",
  nome_invalido: "Confira o nome completo.",
  nascimento_invalido: "Confira a data de nascimento.",
  estoque_comida: "Esse tipo acabou enquanto você preenchia. Escolha outro.",
  comida_idade: "Comida e bebida só para maiores de 12 anos.",
  brincadeira_lotada: "Esta brincadeira lotou enquanto você preenchia.",
  parceiro_ocupado: "Esta pessoa já está nesta brincadeira. Escolha outro parceiro.",
  responsavel_irmao: "Esse responsável já acompanha um irmão. Escolha outro.",
  responsavel_invalido: "Responsável inválido. Faça a busca de novo.",
  nao_elegivel: "Esta pessoa não se encaixa nesta brincadeira.",
  whatsapp_obrigatorio: "Informe o WhatsApp para participar das brincadeiras.",
  whatsapp_invalido: "Confira o número de WhatsApp.",
};

export function mensagemDoErro(erro: ErroInscricao): string {
  return MENSAGENS[erro.codigo] ?? "Não foi possível concluir a inscrição. Tente de novo.";
}

/* Etapa para onde levar a pessoa quando o servidor recusa a inscrição. */
export function etapaDoErro(erro: ErroInscricao, etapas: Etapa[]): string {
  const ref = typeof erro.detalhe.ref === "string" ? erro.detalhe.ref : undefined;
  const key = ref ? keyDeRef(ref) : null;
  const brincadeiraId = typeof erro.detalhe.brincadeira_id === "string" ? erro.detalhe.brincadeira_id : undefined;
  const existe = (id: string) => etapas.some((e) => e.id === id);
  const acha = (pred: (e: Etapa) => boolean) => etapas.find(pred)?.id;

  switch (erro.codigo) {
    case "nome_duplicado":
    case "nome_invalido":
    case "nascimento_invalido": {
      if (key === "principal") return erro.codigo === "nascimento_invalido" ? "nascimento" : "nome";
      if (key === "conjuge") return "conjuge_dados";
      if (key?.startsWith("filho:")) return `filho_dados:${key.split(":")[1]}`;
      return "nome";
    }
    case "estoque_comida":
    case "comida_idade":
      return key && existe(`comida:${key}`) ? `comida:${key}` : "resumo";
    case "brincadeira_lotada":
    case "parceiro_ocupado":
    case "responsavel_irmao":
    case "responsavel_invalido":
    case "nao_elegivel":
      return (
        acha((e) => e.brincadeira?.id === brincadeiraId && (e.tipo !== "brincadeira" || !key || e.pessoa === key)) ?? "resumo"
      );
    case "whatsapp_obrigatorio":
    case "whatsapp_invalido":
      return existe("whatsapp") ? "whatsapp" : "resumo";
    default:
      return "resumo";
  }
}
