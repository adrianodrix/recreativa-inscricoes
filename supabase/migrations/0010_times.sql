-- Times fixos por evento (T1/T2), membros (só crianças e jovens) e RPCs de montagem.
create table public.times (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 60),
  imagem_path text,
  cor_padrao text not null default '#3e2076',
  icone_padrao text not null default 'star',
  ordem integer not null default 0,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (evento_id, nome),
  unique (id, evento_id)
);

create trigger times_atualizado_em
  before update on public.times
  for each row execute function public.marcar_atualizado_em();

-- time_notificado_id: último time comunicado por WhatsApp; a diferença para time_id define quem recebe reenvio (T17).
create table public.membros_time (
  evento_id uuid not null,
  inscrito_id uuid not null,
  time_id uuid not null,
  time_notificado_id uuid references public.times (id) on delete set null,
  atualizado_em timestamptz not null default now(),
  primary key (evento_id, inscrito_id),
  foreign key (inscrito_id, evento_id) references public.inscritos (id, evento_id) on delete cascade,
  foreign key (time_id, evento_id) references public.times (id, evento_id) on delete cascade
);

create index membros_time_time on public.membros_time (time_id);

alter table public.times enable row level security;
alter table public.membros_time enable row level security;

create policy "organizadores leem times" on public.times
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia times" on public.times
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

create policy "organizadores leem membros" on public.membros_time
  for select to authenticated using (public.perfil_atual() is not null);
create policy "administrador gerencia membros" on public.membros_time
  for all to authenticated
  using (public.perfil_atual() = 'administrador')
  with check (public.perfil_atual() = 'administrador');

-- Grava a alocação inteira ({inscrito_id: time_id}) numa transação. Só crianças e jovens (T13).
create or replace function public.salvar_montagem(p_evento_id uuid, p_alocacao jsonb, p_semente integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_par record;
begin
  if public.perfil_atual() <> 'administrador' then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;
  perform 1 from public.eventos where id = p_evento_id for update;
  if not found then raise exception using message = 'evento_invalido', errcode = 'P0001'; end if;

  delete from public.membros_time m
  where m.evento_id = p_evento_id and not (p_alocacao ? m.inscrito_id::text);

  for v_par in select key as inscrito_id, value as time_id from jsonb_each_text(p_alocacao) loop
    if not exists (
      select 1 from public.inscritos i
      where i.id = v_par.inscrito_id::uuid and i.evento_id = p_evento_id
        and (public.categoria_elegivel(i.idade, i.casado, 'criancas') or public.categoria_elegivel(i.idade, i.casado, 'jovens'))
    ) then
      raise exception using message = 'inscrito_nao_elegivel', detail = v_par.inscrito_id, errcode = 'P0001';
    end if;
    if not exists (select 1 from public.times t where t.id = v_par.time_id::uuid and t.evento_id = p_evento_id) then
      raise exception using message = 'time_invalido', detail = v_par.time_id, errcode = 'P0001';
    end if;
    insert into public.membros_time (evento_id, inscrito_id, time_id)
    values (p_evento_id, v_par.inscrito_id::uuid, v_par.time_id::uuid)
    on conflict (evento_id, inscrito_id) do update set time_id = excluded.time_id, atualizado_em = now();
  end loop;

  update public.eventos set montagem_semente = p_semente where id = p_evento_id;
end;
$$;

-- Confirma a montagem (T9). Devolve os inscritos cujo time mudou desde o último aviso (T17),
-- e marca todos como notificados. Exige inscrições encerradas (T5) e pelo menos 2 times.
create or replace function public.confirmar_montagem(p_evento_id uuid)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.eventos;
  v_total integer;
  v_afetados uuid[];
begin
  if public.perfil_atual() <> 'administrador' then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;
  select * into e from public.eventos where id = p_evento_id for update;
  if not found then raise exception using message = 'evento_invalido', errcode = 'P0001'; end if;
  v_total := (select count(*) from public.inscritos where evento_id = e.id);
  if public.motivo_fechado(e, v_total) is null then
    raise exception using message = 'inscricoes_abertas', errcode = 'P0001';
  end if;
  if (select count(*) from public.times where evento_id = e.id) < 2 then
    raise exception using message = 'times_insuficientes', errcode = 'P0001';
  end if;
  if not exists (select 1 from public.membros_time where evento_id = e.id) then
    raise exception using message = 'montagem_vazia', errcode = 'P0001';
  end if;

  select coalesce(array_agg(inscrito_id), '{}') into v_afetados
  from public.membros_time
  where evento_id = e.id and time_notificado_id is distinct from time_id;

  update public.membros_time set time_notificado_id = time_id where evento_id = e.id;
  update public.eventos
  set montagem_status = 'confirmado', montagem_confirmada_em = now(), montagem_confirmada_por = auth.uid()
  where id = e.id;

  return v_afetados;
end;
$$;

revoke execute on function public.salvar_montagem(uuid, jsonb, integer), public.confirmar_montagem(uuid) from public, anon;
grant execute on function public.salvar_montagem(uuid, jsonb, integer), public.confirmar_montagem(uuid) to authenticated, service_role;
