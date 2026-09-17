-- Fila (outbox) de avisos por WhatsApp, destinatários, lembrete de 1 hora antes e agendamento.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
grant usage on schema cron to postgres;

create table public.avisos_whatsapp (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  inscrito_id uuid not null references public.inscritos (id) on delete cascade,
  tipo public.tipo_aviso not null,
  telefone text not null,
  mensagem text,
  status public.status_envio not null default 'pendente',
  tentativas integer not null default 0,
  proxima_tentativa_em timestamptz not null default now(),
  enviado_em timestamptz,
  erro text,
  id_externo text,
  chave_idempotencia text not null unique,
  criado_em timestamptz not null default now()
);

create index avisos_pendentes on public.avisos_whatsapp (proxima_tentativa_em) where status = 'pendente';
create index avisos_inscrito on public.avisos_whatsapp (inscrito_id, criado_em desc);

alter table public.avisos_whatsapp enable row level security;
create policy "organizadores leem avisos" on public.avisos_whatsapp
  for select to authenticated using (public.perfil_atual() is not null);
create policy "operadores escrevem avisos" on public.avisos_whatsapp
  for all to authenticated
  using (public.perfil_atual() in ('operador', 'administrador'))
  with check (public.perfil_atual() in ('operador', 'administrador'));

-- Quem recebe a mensagem sobre um inscrito: ele mesmo (principal com WhatsApp) ou seu inscrito principal.
create or replace function public.destinatario_de(p_inscrito_id uuid)
returns table (inscrito_id uuid, telefone text)
language sql
stable
set search_path = ''
as $$
  select coalesce(p.id, i.id), coalesce(p.whatsapp, i.whatsapp)
  from public.inscritos i
  left join public.inscritos p on p.id = i.inscrito_principal_id
  where i.id = p_inscrito_id and coalesce(p.whatsapp, i.whatsapp) is not null;
$$;

-- Confirmação da inscrição: enfileirada por gatilho, vale para o formulário e para o painel.
create or replace function public.enfileirar_confirmacao()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.avisos_whatsapp (evento_id, inscrito_id, tipo, telefone, chave_idempotencia)
  values (new.evento_id, new.id, 'confirmacao_inscricao', new.whatsapp, 'confirmacao:' || new.id)
  on conflict (chave_idempotencia) do nothing;
  return new;
end;
$$;

create trigger inscritos_enfileirar_confirmacao
  after insert on public.inscritos
  for each row
  when (new.vinculo = 'principal' and new.whatsapp is not null)
  execute function public.enfileirar_confirmacao();

-- Avisos de times para um conjunto de inscritos (T11/T17): inclui os parceiros de dupla
-- (responsável de cada criança e criança de cada responsável) e agrupa por destinatário.
create or replace function public.enfileirar_times_interno(p_evento_id uuid, p_inscritos uuid[], p_tipo public.tipo_aviso, p_sufixo text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_qtd integer;
begin
  with base as (
    select unnest(p_inscritos) as id
  ), parceiros as (
    select b.id from base b
    union
    select x.inscrito_id
    from base b
    join public.participantes a on a.inscrito_id = b.id
    join public.participacoes pc on pc.id = a.participacao_id and pc.categoria = 'pais_e_filhos'
    join public.participantes x on x.participacao_id = pc.id and x.inscrito_id <> b.id
  ), destinos as (
    select distinct d.inscrito_id, d.telefone
    from parceiros p
    cross join lateral public.destinatario_de(p.id) d
  )
  insert into public.avisos_whatsapp (evento_id, inscrito_id, tipo, telefone, chave_idempotencia)
  select p_evento_id, d.inscrito_id, p_tipo, d.telefone, p_tipo || ':' || p_evento_id || ':' || d.inscrito_id || ':' || p_sufixo
  from destinos d
  on conflict (chave_idempotencia) do nothing;
  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$$;

-- Chamada pelo painel após confirmar a montagem.
create or replace function public.enfileirar_avisos_times(p_evento_id uuid, p_inscritos uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.eventos;
begin
  if public.perfil_atual() <> 'administrador' then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;
  select * into e from public.eventos where id = p_evento_id;
  return public.enfileirar_times_interno(
    p_evento_id, p_inscritos, 'times_confirmacao',
    to_char(coalesce(e.montagem_confirmada_em, now()), 'YYYYMMDDHH24MISS')
  );
end;
$$;

-- Lembrete uma hora antes do início (T10), para todos os membros dos times, uma vez só.
create or replace function public.enfileirar_lembretes()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.eventos;
  v_total integer := 0;
begin
  for e in
    select * from public.eventos
    where montagem_status = 'confirmado'
      and public.evento_inicio_em(eventos) - now() between interval '55 minutes' and interval '65 minutes'
  loop
    v_total := v_total + public.enfileirar_times_interno(
      e.id, array(select inscrito_id from public.membros_time where evento_id = e.id), 'times_lembrete', 'lembrete'
    );
  end loop;
  return v_total;
end;
$$;

-- Reserva um lote para o worker (dois ticks nunca pegam a mesma linha).
create or replace function public.reservar_avisos(p_limite integer)
returns setof public.avisos_whatsapp
language sql
security definer
set search_path = ''
as $$
  with escolhidos as (
    select id from public.avisos_whatsapp
    where status = 'pendente' and proxima_tentativa_em <= now()
    order by criado_em
    limit p_limite
    for update skip locked
  )
  update public.avisos_whatsapp a
  set status = 'enviando', tentativas = a.tentativas + 1
  where a.id in (select id from escolhidos)
  returning a.*;
$$;

-- Tick do pg_cron: enfileira lembretes e, se houver pendências, acorda o worker HTTP.
-- URL e segredo ficam no Vault (worker_url, cron_secret); sem eles, nada é chamado.
create or replace function public.chamar_worker_whatsapp()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_segredo text;
begin
  perform public.enfileirar_lembretes();
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'worker_url' limit 1;
  select decrypted_secret into v_segredo from vault.decrypted_secrets where name = 'cron_secret' limit 1;
  if v_url is null or v_segredo is null then return; end if;
  if not exists (select 1 from public.avisos_whatsapp where status = 'pendente' and proxima_tentativa_em <= now()) then return; end if;
  perform extensions.http_post(
    v_url,
    '{}'::jsonb,
    '{}'::jsonb,
    jsonb_build_object('Authorization', 'Bearer ' || v_segredo, 'Content-Type', 'application/json'),
    10000
  );
end;
$$;

do $$
begin
  perform cron.unschedule('recreativa-whatsapp');
exception when others then
  null;
end;
$$;
select cron.schedule('recreativa-whatsapp', '* * * * *', 'select public.chamar_worker_whatsapp()');

revoke execute on function
  public.destinatario_de(uuid),
  public.enfileirar_times_interno(uuid, uuid[], public.tipo_aviso, text),
  public.enfileirar_lembretes(),
  public.chamar_worker_whatsapp()
from public, anon, authenticated;
revoke execute on function public.enfileirar_avisos_times(uuid, uuid[]), public.reservar_avisos(integer) from public, anon;
grant execute on function public.enfileirar_avisos_times(uuid, uuid[]) to authenticated, service_role;
grant execute on function public.reservar_avisos(integer) to service_role;
