-- Funções lidas pelo formulário público (anon) via security definer. Nenhuma tabela é exposta ao anon.

-- Categoria de brincadeira compatível com a pessoa (B5). Pais e filhos é validada pela dupla.
create or replace function public.categoria_elegivel(p_idade smallint, p_casado boolean, p_categoria public.categoria_brincadeira)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select case p_categoria
    when 'criancas' then p_idade <= 8
    when 'jovens' then (not p_casado) and p_idade between 9 and 30
    when 'casais' then p_casado
    when 'pais_e_filhos' then true
  end;
$$;

-- Status efetivo das inscrições (V7).
create or replace function public.motivo_fechado(e public.eventos, p_total integer)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when not e.aberto_manual then 'manual'
    when now() < e.inscricoes_inicio then 'antes_do_periodo'
    when now() >= e.inscricoes_fim then 'periodo_encerrado'
    when p_total >= e.limite_inscritos then 'limite'
    else null
  end;
$$;

create or replace function public.total_inscritos(p_evento_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.inscritos where evento_id = p_evento_id;
$$;

-- Unidades ainda disponíveis por tipo de comida: {"salgado": 87, ...}
create or replace function public.comida_disponivel(p_evento_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(l.tipo, greatest(l.limite - coalesce(c.qtd, 0), 0)), '{}'::jsonb)
  from public.limites_comida l
  left join (
    select tipo, count(*) as qtd from public.colaboracoes where evento_id = p_evento_id group by tipo
  ) c on c.tipo = l.tipo
  where l.evento_id = p_evento_id;
$$;

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
  select * into e from public.eventos where slug = p_slug;
  if not found then return null; end if;
  v_total := public.total_inscritos(e.id);
  return jsonb_build_object(
    'id', e.id, 'nome', e.nome, 'slug', e.slug,
    'data_evento', e.data_evento, 'hora_inicio', e.hora_inicio, 'hora_fim', e.hora_fim,
    'endereco', e.endereco, 'link_maps', e.link_maps,
    'boas_vindas', e.boas_vindas, 'agradecimento', e.agradecimento, 'recomendacoes', e.recomendacoes,
    'valor_inscricao', e.valor_inscricao, 'inscricoes_inicio', e.inscricoes_inicio, 'inscricoes_fim', e.inscricoes_fim,
    'capa_path', e.capa_path, 'limite_inscritos', e.limite_inscritos, 'total_inscritos', v_total,
    'motivo_fechado', public.motivo_fechado(e, v_total),
    'comida_disponivel', public.comida_disponivel(e.id)
  );
end;
$$;

-- Brincadeiras ativas com vaga. Nunca expõe quem participa.
create or replace function public.listar_brincadeiras_disponiveis(p_evento_id uuid)
returns table (
  id uuid, nome text, foto_path text, video_url text, regras jsonb,
  categoria public.categoria_brincadeira, formato public.formato_brincadeira,
  limite_participantes integer, vagas_restantes integer, ordem integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with ocupadas as (
    select brincadeira_id, count(*)::integer as qtd from public.participacoes group by brincadeira_id
  )
  select b.id, b.nome, b.foto_path, b.video_url, b.regras, b.categoria, b.formato, b.limite_participantes,
    b.limite_participantes - coalesce(o.qtd, 0) as vagas_restantes, b.ordem
  from public.brincadeiras b
  left join ocupadas o on o.brincadeira_id = b.id
  where b.evento_id = p_evento_id and b.ativo and b.limite_participantes - coalesce(o.qtd, 0) > 0
  order by b.ordem, b.nome;
$$;

-- Busca de responsável (jovem) por nome, mínimo 3 caracteres, só os livres na brincadeira.
create or replace function public.buscar_jovens_livres(p_evento_id uuid, p_brincadeira_id uuid, p_termo text)
returns table (id uuid, nome_completo text, apelido text)
language sql
stable
security definer
set search_path = ''
as $$
  select i.id, i.nome_completo, i.apelido
  from public.inscritos i
  where i.evento_id = p_evento_id
    and char_length(btrim(coalesce(p_termo, ''))) >= 3
    and public.categoria_elegivel(i.idade, i.casado, 'jovens')
    and position(public.normalizar_nome(p_termo) in i.nome_normalizado) > 0
    and not exists (
      select 1 from public.participantes x where x.brincadeira_id = p_brincadeira_id and x.inscrito_id = i.id
    )
  order by i.nome_completo
  limit 10;
$$;

create or replace function public.verificar_nome_disponivel(p_evento_id uuid, p_nome text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.inscritos
    where evento_id = p_evento_id and nome_normalizado = public.normalizar_nome(p_nome)
  );
$$;

-- Permissões: internas só para o painel/serviço; públicas para anon.
revoke execute on function public.total_inscritos(uuid), public.comida_disponivel(uuid) from public, anon;
grant execute on function public.total_inscritos(uuid), public.comida_disponivel(uuid) to authenticated, service_role;

revoke execute on function
  public.obter_evento_publico(text),
  public.listar_brincadeiras_disponiveis(uuid),
  public.buscar_jovens_livres(uuid, uuid, text),
  public.verificar_nome_disponivel(uuid, text)
from public;
grant execute on function
  public.obter_evento_publico(text),
  public.listar_brincadeiras_disponiveis(uuid),
  public.buscar_jovens_livres(uuid, uuid, text),
  public.verificar_nome_disponivel(uuid, text)
to anon, authenticated, service_role;
