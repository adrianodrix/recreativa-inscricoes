-- Inscritos: um registro por pessoa (principal, cônjuge ou filho), sempre de um evento.
create table public.inscritos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  nome_completo text not null check (char_length(nome_completo) >= 10),
  nome_normalizado text generated always as (public.normalizar_nome(nome_completo)) stored,
  apelido text,
  data_nascimento date not null,
  idade smallint not null check (idade >= 0),
  casado boolean not null default false,
  tem_filhos_menores boolean not null default false,
  inscrito_principal_id uuid,
  vinculo public.tipo_vinculo not null,
  conjuge_situacao public.situacao_dependente,
  filhos_situacao public.situacao_dependente,
  whatsapp text check (whatsapp ~ '^55\d{10,11}$'),
  inscrito_em timestamptz not null default now(),
  criado_por uuid references auth.users (id) on delete set null,
  atualizado_em timestamptz not null default now(),
  unique (evento_id, nome_normalizado),
  unique (id, evento_id),
  check ((vinculo = 'principal') = (inscrito_principal_id is null)),
  foreign key (inscrito_principal_id, evento_id) references public.inscritos (id, evento_id) on delete cascade
);

create unique index inscritos_um_conjuge_por_principal on public.inscritos (inscrito_principal_id) where vinculo = 'conjuge';
create index inscritos_evento_vinculo on public.inscritos (evento_id, vinculo);
create index inscritos_principal on public.inscritos (inscrito_principal_id);
create index inscritos_busca_nome on public.inscritos (evento_id, nome_normalizado text_pattern_ops);

create trigger inscritos_atualizado_em
  before update on public.inscritos
  for each row execute function public.marcar_atualizado_em();

-- Comida/bebida: uma unidade por inscrito.
create table public.colaboracoes (
  inscrito_id uuid primary key,
  evento_id uuid not null,
  tipo public.tipo_comida not null,
  foreign key (inscrito_id, evento_id) references public.inscritos (id, evento_id) on delete cascade
);

create index colaboracoes_evento_tipo on public.colaboracoes (evento_id, tipo);

-- RLS: público anônimo só via RPC; organizadores leem; operador/administrador escrevem.
alter table public.inscritos enable row level security;
alter table public.colaboracoes enable row level security;

create policy "organizadores leem inscritos" on public.inscritos
  for select to authenticated using (public.perfil_atual() is not null);
create policy "operadores escrevem inscritos" on public.inscritos
  for all to authenticated
  using (public.perfil_atual() in ('operador', 'administrador'))
  with check (public.perfil_atual() in ('operador', 'administrador'));

create policy "organizadores leem colaboracoes" on public.colaboracoes
  for select to authenticated using (public.perfil_atual() is not null);
create policy "operadores escrevem colaboracoes" on public.colaboracoes
  for all to authenticated
  using (public.perfil_atual() in ('operador', 'administrador'))
  with check (public.perfil_atual() in ('operador', 'administrador'));
