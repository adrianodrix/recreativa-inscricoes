-- Brincadeiras de um evento e as vagas ocupadas (participações).
create table public.brincadeiras (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 120),
  foto_path text,
  video_url text check (video_url is null or video_url ~ '^https://'),
  regras jsonb not null,
  categoria public.categoria_brincadeira not null,
  limite_participantes integer not null check (limite_participantes > 0),
  formato public.formato_brincadeira,
  ativo boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  check ((categoria = 'casais') = (formato is null)),
  unique (id, evento_id),
  unique (id, categoria)
);

create index brincadeiras_evento on public.brincadeiras (evento_id, ordem);

create trigger brincadeiras_atualizado_em
  before update on public.brincadeiras
  for each row execute function public.marcar_atualizado_em();

-- 1 linha = 1 vaga (pessoa, casal ou dupla, conforme a categoria).
create table public.participacoes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null,
  brincadeira_id uuid not null,
  categoria public.categoria_brincadeira not null,
  criado_em timestamptz not null default now(),
  foreign key (brincadeira_id, evento_id) references public.brincadeiras (id, evento_id) on delete cascade,
  foreign key (brincadeira_id, categoria) references public.brincadeiras (id, categoria),
  unique (id, brincadeira_id)
);

create index participacoes_brincadeira on public.participacoes (brincadeira_id);

-- Quem ocupa cada vaga. unique (brincadeira, inscrito) garante: pessoa 1x,
-- cônjuge 1x, filho em uma dupla só, parceiro em uma dupla só.
create table public.participantes (
  participacao_id uuid not null,
  brincadeira_id uuid not null,
  inscrito_id uuid not null,
  evento_id uuid not null,
  papel public.papel_participante not null,
  primary key (participacao_id, inscrito_id),
  foreign key (participacao_id, brincadeira_id) references public.participacoes (id, brincadeira_id) on delete cascade,
  foreign key (inscrito_id, evento_id) references public.inscritos (id, evento_id) on delete cascade,
  unique (brincadeira_id, inscrito_id)
);

create index participantes_inscrito on public.participantes (inscrito_id);

-- Ao remover um inscrito, a vaga que ficou sem ninguém é liberada.
create or replace function public.limpar_participacao_vazia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.participacoes p
  where p.id = old.participacao_id
    and not exists (select 1 from public.participantes x where x.participacao_id = p.id);
  return old;
end;
$$;

create trigger participantes_limpar_vaga
  after delete on public.participantes
  for each row execute function public.limpar_participacao_vazia();

-- RLS
alter table public.brincadeiras enable row level security;
alter table public.participacoes enable row level security;
alter table public.participantes enable row level security;

create policy "organizadores leem brincadeiras" on public.brincadeiras
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia brincadeiras" on public.brincadeiras
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

create policy "organizadores leem participacoes" on public.participacoes
  for select to authenticated using (public.perfil_atual() is not null);
create policy "operadores escrevem participacoes" on public.participacoes
  for all to authenticated
  using (public.perfil_atual() in ('operador', 'administrador'))
  with check (public.perfil_atual() in ('operador', 'administrador'));

create policy "organizadores leem participantes" on public.participantes
  for select to authenticated using (public.perfil_atual() is not null);
create policy "operadores escrevem participantes" on public.participantes
  for all to authenticated
  using (public.perfil_atual() in ('operador', 'administrador'))
  with check (public.perfil_atual() in ('operador', 'administrador'));
