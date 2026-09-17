-- Correção de segurança: comparações com perfil_atual() nulo (usuário sem perfil ou desativado)
-- não disparavam a exceção, pois NULL <> 'x' é NULL. Agora usa is distinct from / coalesce.

create or replace function public.exigir_operador()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if coalesce(public.perfil_atual()::text, '') not in ('operador', 'administrador') then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.exigir_administrador()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if public.perfil_atual() is distinct from 'administrador'::public.perfil_usuario then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.salvar_montagem(p_evento_id uuid, p_alocacao jsonb, p_semente integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_par record;
begin
  perform public.exigir_administrador();
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
  perform public.exigir_administrador();
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

create or replace function public.enfileirar_avisos_times(p_evento_id uuid, p_inscritos uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  e public.eventos;
begin
  perform public.exigir_administrador();
  select * into e from public.eventos where id = p_evento_id;
  return public.enfileirar_times_interno(
    p_evento_id, p_inscritos, 'times_confirmacao',
    to_char(coalesce(e.montagem_confirmada_em, now()), 'YYYYMMDDHH24MISS')
  );
end;
$$;

revoke execute on function public.exigir_administrador() from public, anon, authenticated;
