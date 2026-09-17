import "server-only";
import { listarBrincadeiras } from "@/lib/brincadeiras/consultas";
import { obterEvento } from "@/lib/eventos/consultas";
import { statusInscricoes } from "@/lib/eventos/status";
import { listarContatos, listarPerguntas, listarProgramacao } from "@/lib/pagina-inicial/consultas";
import { listarTimes } from "@/lib/times/consultas";
import type { DadosPaginaInicial } from "./tipos";

/*
 * Os mesmos dados da página inicial, lidos das tabelas pelo organizador logado.
 * Serve à prévia do painel, inclusive com o evento ainda em preparação (P6).
 */
export async function carregarPrevia(eventoId: string): Promise<DadosPaginaInicial | null> {
  const evento = await obterEvento(eventoId);
  if (!evento) return null;

  const [programacao, perguntas, contatos, times, brincadeiras] = await Promise.all([
    listarProgramacao(eventoId),
    listarPerguntas(eventoId),
    listarContatos(eventoId),
    listarTimes(eventoId),
    listarBrincadeiras(eventoId),
  ]);
  const nomeBrincadeira = new Map(brincadeiras.map((b) => [b.id, b.nome]));
  const status = statusInscricoes(evento, evento.total_inscritos);

  return {
    evento: {
      id: evento.id,
      nome: evento.nome,
      slug: evento.slug,
      edicao: evento.edicao,
      subtitulo: evento.subtitulo,
      descricao: evento.descricao,
      data_evento: evento.data_evento,
      hora_inicio: evento.hora_inicio,
      hora_fim: evento.hora_fim,
      endereco: evento.endereco,
      link_maps: evento.link_maps,
      link_fotos: evento.link_fotos,
      capa_path: evento.capa_path,
      valor_inscricao: Number(evento.valor_inscricao),
      inscricoes_inicio: evento.inscricoes_inicio,
      inscricoes_fim: evento.inscricoes_fim,
      limite_inscritos: evento.limite_inscritos,
      total_inscritos: evento.total_inscritos,
      motivo_fechado: status.motivo,
      recomendacoes: evento.recomendacoes,
      regras_gerais: evento.regras_gerais,
    },
    programacao: programacao.map((p) => ({
      id: p.id,
      hora_inicio: p.hora_inicio,
      hora_fim: p.hora_fim,
      titulo: p.titulo,
      detalhe: p.detalhe,
      destaque: p.destaque,
      brincadeira: p.brincadeira_id ? (nomeBrincadeira.get(p.brincadeira_id) ?? null) : null,
    })),
    perguntas: perguntas.map((q) => ({ id: q.id, pergunta: q.pergunta, resposta: q.resposta })),
    contatos: contatos.map((c) => ({ id: c.id, nome: c.nome, whatsapp: c.whatsapp })),
    times: times.map((t) => ({
      id: t.id,
      nome: t.nome,
      imagem_path: t.imagem_path,
      cor_padrao: t.cor_padrao,
      icone_padrao: t.icone_padrao,
    })),
    brincadeiras: brincadeiras
      .filter((b) => b.ativo)
      .map((b) => ({
        id: b.id,
        nome: b.nome,
        foto_path: b.foto_path,
        categoria: b.categoria,
        lotada: b.vagas_ocupadas >= b.limite_participantes,
      })),
  };
}
