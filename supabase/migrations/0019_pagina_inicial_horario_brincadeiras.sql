-- A página inicial mostra o horário de cada brincadeira, tirado da programação do
-- dia. Para ligar horário e brincadeira sem depender do nome (que pode repetir),
-- cada item da programação passa a trazer também o id da brincadeira.
-- Mesma função da 0014, só com 'brincadeira_id' a mais na programação.
create or replace function public.obter_pagina_inicial()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e public.eventos;
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_total integer;
begin
  select * into e from public.eventos
  where publicado
  order by (data_evento >= v_hoje) desc,
    case when data_evento >= v_hoje then data_evento end asc,
    data_evento desc
  limit 1;
  if not found then return null; end if;
  v_total := public.total_inscritos(e.id);

  return public.evento_publico_json(e, v_total) || jsonb_build_object(
    'programacao', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id, 'hora_inicio', p.hora_inicio, 'hora_fim', p.hora_fim,
        'titulo', p.titulo, 'detalhe', p.detalhe, 'destaque', p.destaque,
        'brincadeira', b.nome, 'brincadeira_id', p.brincadeira_id
      ) order by p.hora_inicio, p.titulo), '[]'::jsonb)
      from public.programacao p
      left join public.brincadeiras b on b.id = p.brincadeira_id
      where p.evento_id = e.id
    ),
    'perguntas', (
      select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'pergunta', q.pergunta, 'resposta', q.resposta)
        order by q.ordem, q.criado_em), '[]'::jsonb)
      from public.perguntas_frequentes q where q.evento_id = e.id
    ),
    'contatos', (
      select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome, 'whatsapp', c.whatsapp)
        order by c.ordem, c.criado_em), '[]'::jsonb)
      from public.contatos c where c.evento_id = e.id
    ),
    'times', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', t.id, 'nome', t.nome, 'imagem_path', t.imagem_path,
        'cor_padrao', t.cor_padrao, 'icone_padrao', t.icone_padrao
      ) order by t.ordem, t.nome), '[]'::jsonb)
      from public.times t where t.evento_id = e.id
    ),
    'brincadeiras', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id, 'nome', b.nome, 'foto_path', b.foto_path, 'categoria', b.categoria,
        'formato', b.formato, 'lotada', b.limite_participantes - coalesce(o.qtd, 0) <= 0
      ) order by b.ordem, b.nome), '[]'::jsonb)
      from public.brincadeiras b
      left join (
        select brincadeira_id, count(*)::integer as qtd from public.participacoes group by brincadeira_id
      ) o on o.brincadeira_id = b.id
      where b.evento_id = e.id and b.ativo
    )
  );
end;
$$;
