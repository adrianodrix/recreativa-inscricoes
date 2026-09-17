import "server-only";
import type { BrincadeiraPublica, EventoPublico, TipoComida } from "@/features/inscricao/modelo/tipos";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { TextoRico } from "@/lib/texto-rico/schema";

/* Evento pelo slug com brincadeiras disponíveis, via RPCs públicas (anon). */
export async function obterEventoPublico(slug: string): Promise<EventoPublico | null> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.rpc("obter_evento_publico", { p_slug: slug });
  if (error) throw new Error(`Falha ao carregar evento: ${error.message}`);
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const e = data as Record<string, unknown>;

  const { data: brincadeiras, error: erroB } = await supabase.rpc("listar_brincadeiras_disponiveis", {
    p_evento_id: e.id as string,
  });
  if (erroB) throw new Error(`Falha ao carregar brincadeiras: ${erroB.message}`);

  const comida = (e.comida_disponivel ?? {}) as Partial<Record<TipoComida, number>>;
  return {
    id: e.id as string,
    nome: e.nome as string,
    slug: e.slug as string,
    data_evento: e.data_evento as string,
    hora_inicio: e.hora_inicio as string,
    hora_fim: e.hora_fim as string,
    endereco: e.endereco as string,
    link_maps: e.link_maps as string,
    boas_vindas: (e.boas_vindas as TextoRico | null) ?? null,
    agradecimento: e.agradecimento as TextoRico,
    recomendacoes: (e.recomendacoes as TextoRico | null) ?? null,
    valor_inscricao: Number(e.valor_inscricao ?? 0),
    motivo_fechado: (e.motivo_fechado as string | null) ?? null,
    comida_disponivel: {
      salgado: comida.salgado ?? 0,
      doce: comida.doce ?? 0,
      refrigerante: comida.refrigerante ?? 0,
      suco: comida.suco ?? 0,
    },
    brincadeiras: (brincadeiras ?? []).map(
      (b): BrincadeiraPublica => ({
        id: b.id,
        nome: b.nome,
        foto_path: b.foto_path,
        video_url: b.video_url,
        regras: b.regras as TextoRico,
        categoria: b.categoria,
        formato: b.formato,
        vagas_restantes: b.vagas_restantes,
      }),
    ),
  };
}
