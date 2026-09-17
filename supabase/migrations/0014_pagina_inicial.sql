-- Página inicial do evento em destaque (P1–P12): chave de publicação, campos de
-- divulgação, programação do dia, dúvidas, contatos e a RPC pública que monta a página.

alter table public.eventos
  add column publicado boolean not null default false,
  add column edicao smallint check (edicao is null or edicao > 0),
  add column subtitulo text check (subtitulo is null or char_length(subtitulo) between 2 and 80),
  add column descricao text check (descricao is null or char_length(descricao) between 2 and 300),
  add column link_fotos text check (link_fotos is null or link_fotos ~ '^https://'),
  add column regras_gerais jsonb;

-- Eventos que já existiam continuam no ar; os novos nascem em preparação (P6).
update public.eventos set publicado = true;

-- Programação do dia (P9). Itens sem brincadeira são os momentos do evento
-- (caridade, lanche, encerramento); com brincadeira, apontam para a dinâmica.
create table public.programacao (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  hora_inicio time not null,
  hora_fim time,
  titulo text not null check (char_length(titulo) between 2 and 80),
  detalhe text check (detalhe is null or char_length(detalhe) between 2 and 120),
  brincadeira_id uuid,
  destaque boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check (hora_fim is null or hora_fim > hora_inicio),
  foreign key (brincadeira_id, evento_id) references public.brincadeiras (id, evento_id) on delete set null (brincadeira_id)
);

create index programacao_evento on public.programacao (evento_id, hora_inicio);

create trigger programacao_atualizado_em
  before update on public.programacao
  for each row execute function public.marcar_atualizado_em();

-- Dúvidas frequentes (P8/P11). Resposta em texto rico, como as regras.
create table public.perguntas_frequentes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  pergunta text not null check (char_length(pergunta) between 5 and 160),
  resposta jsonb not null,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index perguntas_frequentes_evento on public.perguntas_frequentes (evento_id, ordem);

create trigger perguntas_frequentes_atualizado_em
  before update on public.perguntas_frequentes
  for each row execute function public.marcar_atualizado_em();

-- Contatos do rodapé (P8/P11). Mesmo formato de telefone dos avisos.
create table public.contatos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 60),
  whatsapp text not null check (whatsapp ~ '^55\d{10,11}$'),
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index contatos_evento on public.contatos (evento_id, ordem);

create trigger contatos_atualizado_em
  before update on public.contatos
  for each row execute function public.marcar_atualizado_em();

alter table public.programacao enable row level security;
alter table public.perguntas_frequentes enable row level security;
alter table public.contatos enable row level security;

create policy "organizadores leem programacao" on public.programacao
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia programacao" on public.programacao
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

create policy "organizadores leem perguntas" on public.perguntas_frequentes
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia perguntas" on public.perguntas_frequentes
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

create policy "organizadores leem contatos" on public.contatos
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia contatos" on public.contatos
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

-- Evento em preparação é tratado como inscrições fechadas: o formulário público
-- recusa (criar_inscricao já consulta esta função) e o painel continua podendo
-- incluir inscritos com p_ignorar_status. A montagem de times não é afetada,
-- porque ela só exige que as inscrições não estejam abertas.
create or replace function public.motivo_fechado(e public.eventos, p_total integer)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when not e.publicado then 'nao_publicado'
    when not e.aberto_manual then 'manual'
    when now() < e.inscricoes_inicio then 'antes_do_periodo'
    when now() >= e.inscricoes_fim then 'periodo_encerrado'
    when p_total >= e.limite_inscritos then 'limite'
    else null
  end;
$$;

-- Campos públicos comuns ao formulário e à página inicial.
create or replace function public.evento_publico_json(e public.eventos, p_total integer)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', e.id, 'nome', e.nome, 'slug', e.slug, 'edicao', e.edicao,
    'subtitulo', e.subtitulo, 'descricao', e.descricao,
    'data_evento', e.data_evento, 'hora_inicio', e.hora_inicio, 'hora_fim', e.hora_fim,
    'endereco', e.endereco, 'link_maps', e.link_maps, 'link_fotos', e.link_fotos,
    'boas_vindas', e.boas_vindas, 'agradecimento', e.agradecimento,
    'recomendacoes', e.recomendacoes, 'regras_gerais', e.regras_gerais,
    'valor_inscricao', e.valor_inscricao,
    'inscricoes_inicio', e.inscricoes_inicio, 'inscricoes_fim', e.inscricoes_fim,
    'capa_path', e.capa_path, 'limite_inscritos', e.limite_inscritos, 'total_inscritos', p_total,
    'motivo_fechado', public.motivo_fechado(e, p_total)
  );
$$;

-- Evento pelo slug. Em preparação não existe para o público (P6).
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
  return public.evento_publico_json(e, v_total)
    || jsonb_build_object('comida_disponivel', public.comida_disponivel(e.id));
end;
$$;

-- Página inicial (P5): o próximo evento publicado (o de hoje conta); sem nenhum
-- à frente, o último realizado. Devolve tudo o que a página mostra, sem expor inscritos.
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
        'brincadeira', b.nome
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

-- Ao criar um evento, contatos e dúvidas vêm do evento anterior para o
-- administrador só ajustar (P11). Cada lista busca o evento mais recente que
-- tenha itens, porque uma edição pode ter sido cadastrada sem preencher a outra.
-- Não faz nada se o evento já tiver os seus.
create or replace function public.copiar_contatos_e_duvidas(p_evento_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  insert into public.contatos (evento_id, nome, whatsapp, ordem)
  select p_evento_id, c.nome, c.whatsapp, c.ordem
  from public.contatos c
  where c.evento_id = (
      select c2.evento_id from public.contatos c2
      join public.eventos e on e.id = c2.evento_id
      where c2.evento_id <> p_evento_id
      group by c2.evento_id, e.data_evento
      order by e.data_evento desc
      limit 1
    )
    and not exists (select 1 from public.contatos x where x.evento_id = p_evento_id);

  insert into public.perguntas_frequentes (evento_id, pergunta, resposta, ordem)
  select p_evento_id, q.pergunta, q.resposta, q.ordem
  from public.perguntas_frequentes q
  where q.evento_id = (
      select q2.evento_id from public.perguntas_frequentes q2
      join public.eventos e on e.id = q2.evento_id
      where q2.evento_id <> p_evento_id
      group by q2.evento_id, e.data_evento
      order by e.data_evento desc
      limit 1
    )
    and not exists (select 1 from public.perguntas_frequentes x where x.evento_id = p_evento_id);
end;
$$;

revoke execute on function public.evento_publico_json(public.eventos, integer) from public, anon;
grant execute on function public.evento_publico_json(public.eventos, integer) to authenticated, service_role;

revoke execute on function public.copiar_contatos_e_duvidas(uuid) from public, anon;
grant execute on function public.copiar_contatos_e_duvidas(uuid) to authenticated, service_role;

revoke execute on function public.obter_pagina_inicial() from public;
grant execute on function public.obter_pagina_inicial() to anon, authenticated, service_role;
