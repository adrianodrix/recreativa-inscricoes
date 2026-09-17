-- Usuários do painel (organizadores), perfis, RLS e administrador inicial.
create table public.usuarios_painel (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  nome text not null,
  perfil public.perfil_usuario not null default 'analitico',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create trigger usuarios_painel_atualizado_em
  before update on public.usuarios_painel
  for each row execute function public.marcar_atualizado_em();

-- Perfil do usuário autenticado (nulo se não for organizador ativo).
create or replace function public.perfil_atual()
returns public.perfil_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select perfil from public.usuarios_painel where id = auth.uid() and ativo;
$$;

revoke execute on function public.perfil_atual() from public, anon;
grant execute on function public.perfil_atual() to authenticated;

-- RLS: o público anônimo nunca lê tabelas diretamente (só RPCs security definer).
alter table public.usuarios_painel enable row level security;
alter table public.eventos enable row level security;
alter table public.limites_comida enable row level security;

create policy "organizadores leem usuarios" on public.usuarios_painel
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia usuarios" on public.usuarios_painel
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

create policy "organizadores leem eventos" on public.eventos
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia eventos" on public.eventos
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

create policy "organizadores leem limites" on public.limites_comida
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia limites" on public.limites_comida
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

-- Administrador inicial. Repositório público: nenhuma senha aqui. A senha é aleatória
-- e o primeiro acesso é feito por "Esqueci minha senha" na tela de login.
do $$
declare
  v_email constant text := 'adrianodrix@gmail.com';
  v_id uuid := gen_random_uuid();
begin
  if exists (select 1 from auth.users where email = v_email) then
    select id into v_id from auth.users where email = v_email;
  else
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token,
      is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
      '', '', '', '', '', '', '', '', false, false
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), v_id, v_email,
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
      'email', null, now(), now()
    );
  end if;

  insert into public.usuarios_painel (id, email, nome, perfil)
  values (v_id, v_email, 'Administrador', 'administrador')
  on conflict (id) do nothing;
end;
$$;
