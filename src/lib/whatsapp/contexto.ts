import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ROTULO_COMIDA } from "@/lib/eventos/schema";
import type { Database } from "@/lib/supabase/types";
import { paraWhatsapp } from "@/lib/texto-rico/whatsapp";
import type { TextoRico } from "@/lib/texto-rico/schema";
import { mensagemConfirmacao, mensagemLembrete, mensagemTimes, type EventoMensagem, type ItemTime, type PessoaMensagem } from "./templates";

type Admin = SupabaseClient<Database>;
export type AvisoLinha = Database["public"]["Tables"]["avisos_whatsapp"]["Row"];

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome;

async function carregarEvento(admin: Admin, eventoId: string): Promise<EventoMensagem> {
  const { data: e, error } = await admin.from("eventos").select("*").eq("id", eventoId).single();
  if (error) throw new Error(`Evento do aviso não encontrado: ${error.message}`);
  return {
    nome: e.nome,
    data_evento: e.data_evento,
    hora_inicio: e.hora_inicio,
    hora_fim: e.hora_fim,
    endereco: e.endereco,
    link_maps: e.link_maps,
    valor_inscricao: Number(e.valor_inscricao),
    recomendacoes: e.recomendacoes ? paraWhatsapp(e.recomendacoes as TextoRico) : null,
  };
}

/* Monta o texto de um aviso a partir do estado atual do banco (nunca de um snapshot antigo). */
export async function montarMensagem(admin: Admin, aviso: AvisoLinha): Promise<string> {
  const evento = await carregarEvento(admin, aviso.evento_id);
  const { data: principal } = await admin.from("inscritos").select("*").eq("id", aviso.inscrito_id).single();
  if (!principal) throw new Error("Inscrito do aviso não encontrado");
  const { data: dependentes } = await admin.from("inscritos").select("*").eq("inscrito_principal_id", principal.id).order("vinculo");
  const casa = [principal, ...(dependentes ?? [])];
  const ids = casa.map((i) => i.id);

  const [colaboracoes, participantes, brincadeiras, membros, times] = await Promise.all([
    admin.from("colaboracoes").select("inscrito_id, tipo").in("inscrito_id", ids),
    admin.from("participantes").select("inscrito_id, participacao_id, brincadeira_id, papel").eq("evento_id", aviso.evento_id),
    admin.from("brincadeiras").select("id, nome").eq("evento_id", aviso.evento_id),
    admin.from("membros_time").select("inscrito_id, time_id").eq("evento_id", aviso.evento_id),
    admin.from("times").select("id, nome").eq("evento_id", aviso.evento_id),
  ]);
  const comida = new Map((colaboracoes.data ?? []).map((c) => [c.inscrito_id, ROTULO_COMIDA[c.tipo]]));
  const nomeBrincadeira = new Map((brincadeiras.data ?? []).map((b) => [b.id, b.nome]));
  const nomeTime = new Map((times.data ?? []).map((t) => [t.id, t.nome]));
  const timeDe = new Map((membros.data ?? []).map((m) => [m.inscrito_id, nomeTime.get(m.time_id) ?? "?"]));
  const todos = participantes.data ?? [];

  if (aviso.tipo === "confirmacao_inscricao") {
    const pessoa = (i: (typeof casa)[number]): PessoaMensagem => ({
      nome: i.nome_completo,
      apelido: i.apelido,
      comida: comida.get(i.id) ?? null,
      brincadeiras: [...new Set(todos.filter((p) => p.inscrito_id === i.id).map((p) => nomeBrincadeira.get(p.brincadeira_id) ?? "?"))],
    });
    return mensagemConfirmacao({ evento, principal: pessoa(principal), dependentes: (dependentes ?? []).map(pessoa) });
  }

  // Duplas em que alguém da casa é responsável: a criança acompanhada e seu time.
  const participacoesComoResponsavel = new Set(todos.filter((p) => ids.includes(p.inscrito_id) && p.papel === "responsavel").map((p) => p.participacao_id));
  const acompanhadosIds = [...new Set(todos.filter((p) => participacoesComoResponsavel.has(p.participacao_id) && p.papel === "filho").map((p) => p.inscrito_id))];
  const { data: acompanhados } = acompanhadosIds.length ? await admin.from("inscritos").select("id, nome_completo").in("id", acompanhadosIds) : { data: [] };

  const item = (id: string, nome: string): ItemTime | null => (timeDe.has(id) ? { nome, time: timeDe.get(id)! } : null);
  const ctx = {
    evento,
    destinatario: primeiroNome(principal.apelido || principal.nome_completo),
    proprio: item(principal.id, principal.nome_completo),
    filhos: (dependentes ?? []).flatMap((d) => (item(d.id, d.nome_completo) ? [item(d.id, d.nome_completo)!] : [])),
    acompanhados: (acompanhados ?? []).flatMap((a) => (item(a.id, a.nome_completo) ? [item(a.id, a.nome_completo)!] : [])),
  };
  if (aviso.tipo === "times_lembrete") return mensagemLembrete(ctx);
  return mensagemTimes(ctx, aviso.tipo === "times_alteracao");
}
