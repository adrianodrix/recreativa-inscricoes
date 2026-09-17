/* Textos das mensagens de WhatsApp (formatação: *negrito*, _itálico_). Puro, testável. */
import { formatarDataExtenso, formatarHora, formatarValor } from "@/lib/datas";

export interface EventoMensagem {
  nome: string;
  data_evento: string;
  hora_inicio: string;
  hora_fim: string;
  endereco: string;
  link_maps: string;
  valor_inscricao: number;
  recomendacoes: string | null; // já convertido para texto do WhatsApp
}

export interface PessoaMensagem {
  nome: string;
  apelido?: string | null;
  comida?: string | null;
  brincadeiras: string[];
}

export interface ContextoConfirmacao {
  evento: EventoMensagem;
  principal: PessoaMensagem;
  dependentes: PessoaMensagem[];
}

export interface ItemTime {
  nome: string; // pessoa
  time: string;
}

export interface ContextoTimes {
  evento: EventoMensagem;
  destinatario: string; // primeiro nome de quem recebe
  proprio: ItemTime | null; // time do próprio destinatário (jovem)
  filhos: ItemTime[];
  acompanhados: ItemTime[]; // crianças de quem é responsável
}

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

function cabecalhoEvento(e: EventoMensagem): string {
  return [
    `📅 ${formatarDataExtenso(e.data_evento)}, das ${formatarHora(e.hora_inicio)} às ${formatarHora(e.hora_fim)}`,
    `📍 ${e.endereco}`,
    `🗺️ ${e.link_maps}`,
  ].join("\n");
}

function linhaPessoa(p: PessoaMensagem): string {
  const partes = [`• *${p.nome}*${p.apelido ? ` (${p.apelido})` : ""}`];
  if (p.comida) partes.push(`  Leva: ${p.comida}`);
  if (p.brincadeiras.length) partes.push(`  Brincadeiras: ${p.brincadeiras.join(", ")}`);
  return partes.join("\n");
}

export function mensagemConfirmacao(ctx: ContextoConfirmacao): string {
  const blocos = [
    `Olá, ${primeiroNome(ctx.principal.nome)}! Sua inscrição na *${ctx.evento.nome}* está confirmada. 🎉`,
    cabecalhoEvento(ctx.evento),
    ["*Inscritos:*", linhaPessoa(ctx.principal), ...ctx.dependentes.map(linhaPessoa)].join("\n"),
  ];
  if (ctx.evento.valor_inscricao > 0) blocos.push(`💰 Valor da inscrição: ${formatarValor(ctx.evento.valor_inscricao)} por pessoa (combinar com os organizadores).`);
  if (ctx.evento.recomendacoes) blocos.push(`*Recomendações importantes:*\n${ctx.evento.recomendacoes}`);
  blocos.push("Nos vemos lá! 🙏");
  return blocos.join("\n\n");
}

function blocoTimes(ctx: ContextoTimes): string {
  const linhas: string[] = [];
  if (ctx.proprio) linhas.push(`• Você (${primeiroNome(ctx.proprio.nome)}): *${ctx.proprio.time}*`);
  for (const f of ctx.filhos) linhas.push(`• ${f.nome}: *${f.time}*`);
  for (const a of ctx.acompanhados) linhas.push(`• ${a.nome} (você acompanha nas duplas): *${a.time}*`);
  return linhas.join("\n");
}

export function mensagemTimes(ctx: ContextoTimes, alteracao = false): string {
  const abertura = alteracao
    ? `Olá, ${ctx.destinatario}! Houve uma mudança nos times da *${ctx.evento.nome}*. Confira:`
    : `Olá, ${ctx.destinatario}! Os times da *${ctx.evento.nome}* estão montados. 🏆`;
  return [abertura, blocoTimes(ctx), "O mesmo time fica junto em todas as brincadeiras em grupo. Até lá! 🙌"].join("\n\n");
}

export function mensagemLembrete(ctx: ContextoTimes): string {
  return [
    `Olá, ${ctx.destinatario}! A *${ctx.evento.nome}* começa em 1 hora. ⏰`,
    cabecalhoEvento(ctx.evento),
    `*Times:*\n${blocoTimes(ctx)}`,
    ctx.evento.recomendacoes ? `*Recomendações importantes:*\n${ctx.evento.recomendacoes}` : "",
    "Boa Recreativa! 🎈",
  ]
    .filter(Boolean)
    .join("\n\n");
}
