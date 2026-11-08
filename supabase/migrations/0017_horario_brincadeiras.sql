-- O formulário de inscrição destaca o horário de cada brincadeira. O horário vem
-- da programação do dia (itens ligados a uma brincadeira), que a página inicial
-- já mostra ao público; uma brincadeira pode ter mais de um horário.
create or replace function public.obter_evento_publico(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e public.eventos;
  v_total integer;
begin
  select * into e from public.eventos where slug = p_slug and publicado;
  if not found then return null; end if;
  v_total := public.total_inscritos(e.id);
  return public.evento_publico_json(e, v_total) || jsonb_build_object(
    'comida_disponivel', public.comida_disponivel(e.id),
    'contatos', (
      select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome, 'whatsapp', c.whatsapp)
        order by c.ordem, c.criado_em), '[]'::jsonb)
      from public.contatos c where c.evento_id = e.id
    ),
    'horarios_brincadeiras', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'brincadeira_id', p.brincadeira_id, 'hora_inicio', p.hora_inicio, 'hora_fim', p.hora_fim
      ) order by p.hora_inicio, p.hora_fim), '[]'::jsonb)
      from public.programacao p
      where p.evento_id = e.id and p.brincadeira_id is not null
    )
  );
end;
$$;
