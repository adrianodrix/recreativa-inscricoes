-- Eventos (uma edição da Recreativa por linha) e limites de comida/bebida.
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and slug not in ('painel', 'api', 'obrigado')),
  data_evento date not null,
  hora_inicio time not null,
  hora_fim time not null check (hora_fim > hora_inicio),
  endereco text not null check (char_length(endereco) >= 5),
  link_maps text not null check (link_maps ~ '^https://'),
  boas_vindas jsonb,
  agradecimento jsonb not null,
  recomendacoes jsonb,
  inscricoes_inicio timestamptz not null,
  inscricoes_fim timestamptz not null check (inscricoes_fim > inscricoes_inicio),
  aberto_manual boolean not null default true,
  limite_inscritos integer not null check (limite_inscritos > 0),
  valor_inscricao numeric(10, 2) not null default 0 check (valor_inscricao >= 0),
  capa_path text,
  montagem_status public.status_montagem not null default 'rascunho',
  montagem_confirmada_em timestamptz,
  montagem_confirmada_por uuid references auth.users (id) on delete set null,
  montagem_semente integer,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger eventos_atualizado_em
  before update on public.eventos
  for each row execute function public.marcar_atualizado_em();

-- Instante de início do evento no fuso do Brasil (usado pelo lembrete de 1 hora antes).
create or replace function public.evento_inicio_em(e public.eventos)
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select (e.data_evento + e.hora_inicio) at time zone 'America/Sao_Paulo';
$$;

create table public.limites_comida (
  evento_id uuid not null references public.eventos (id) on delete cascade,
  tipo public.tipo_comida not null,
  limite integer not null check (limite >= 0),
  primary key (evento_id, tipo)
);
