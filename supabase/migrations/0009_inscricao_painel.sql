-- Inscrição pelo painel (mesmos limites, sem a trava de período/chave), troca de comida
-- respeitando o estoque e limpeza de vagas de casal/dupla ao remover um participante.

create or replace function public.exigir_operador()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if public.perfil_atual() not in ('operador', 'administrador') then
    raise exception using message = 'sem_permissao', errcode = 'P0001';
  end if;
end;
$$;

-- Corpo compartilhado. p_ignorar_status = true para o painel.
create or replace function public.criar_inscricao_interno(p jsonb, p_ignorar_status boolean)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  e public.eventos;
  v_total integer;
  v_pessoas integer;
  v_principal jsonb := p->'principal';
  v_tem_conjuge boolean := jsonb_typeof(p->'conjuge') = 'object';
  v_filhos jsonb := coalesce(p->'filhos', '[]'::jsonb);
  v_participacoes jsonb := coalesce(p->'participacoes', '[]'::jsonb);
  v_ids jsonb;
  v_principal_id uuid;
  v_id uuid;
  v_idade smallint;
  v_casado boolean := coalesce((v_principal->>'casado')::boolean, false);
  v_item jsonb;
  v_ref text;
  v_idx integer := 0;
begin
  select * into e from public.eventos where id = (p->>'evento_id')::uuid for update;
  if not found then perform public.erro_inscricao('evento_invalido'); end if;

  v_total := (select count(*) from public.inscritos where evento_id = e.id);
  if not p_ignorar_status and public.motivo_fechado(e, v_total) is not null then
    perform public.erro_inscricao('inscricoes_fechadas', jsonb_build_object('motivo', public.motivo_fechado(e, v_total)));
  end if;

  v_pessoas := 1 + (case when v_tem_conjuge then 1 else 0 end) + jsonb_array_length(v_filhos);
  if v_total + v_pessoas > e.limite_inscritos then
    perform public.erro_inscricao('limite_evento', jsonb_build_object('vagas', e.limite_inscritos - v_total));
  end if;

  if jsonb_array_length(v_participacoes) > 0 and coalesce(v_principal->>'whatsapp', '') = '' then
    perform public.erro_inscricao('whatsapp_obrigatorio');
  end if;
  if v_principal->>'whatsapp' is not null and v_principal->>'whatsapp' !~ '^55\d{10,11}$' then
    perform public.erro_inscricao('whatsapp_invalido');
  end if;

  v_principal_id := public.inserir_pessoa(e, v_principal, 'principal', null, 'principal');
  v_ids := jsonb_build_object('principal', v_principal_id);
  select idade into v_idade from public.inscritos where id = v_principal_id;
  if v_casado and v_idade <= 18 then perform public.erro_inscricao('casado_menor'); end if;
  if (v_tem_conjuge or jsonb_array_length(v_filhos) > 0) and not v_casado then
    perform public.erro_inscricao('dependentes_sem_casamento');
  end if;

  if v_tem_conjuge then
    v_id := public.inserir_pessoa(e, (p->'conjuge') || '{"casado": true}'::jsonb, 'conjuge', v_principal_id, 'conjuge');
    v_ids := v_ids || jsonb_build_object('conjuge', v_id);
  end if;

  for v_item in select * from jsonb_array_elements(v_filhos) loop
    v_idx := v_idx + 1;
    v_ref := coalesce(v_item->>'ref', 'filho:' || v_idx);
    v_id := public.inserir_pessoa(e, v_item, 'filho', v_principal_id, v_ref);
    select idade into v_idade from public.inscritos where id = v_id;
    if v_idade >= 18 then perform public.erro_inscricao('filho_maior', jsonb_build_object('ref', v_ref)); end if;
    v_ids := v_ids || jsonb_build_object(v_ref, v_id);
  end loop;

  perform public.registrar_colaboracao(e.id, v_principal_id, v_principal->>'comida', 'principal');
  if v_tem_conjuge then
    perform public.registrar_colaboracao(e.id, (v_ids->>'conjuge')::uuid, p->'conjuge'->>'comida', 'conjuge');
  end if;
  v_idx := 0;
  for v_item in select * from jsonb_array_elements(v_filhos) loop
    v_idx := v_idx + 1;
    v_ref := coalesce(v_item->>'ref', 'filho:' || v_idx);
    perform public.registrar_colaboracao(e.id, (v_ids->>v_ref)::uuid, v_item->>'comida', v_ref);
  end loop;

  for v_item in select * from jsonb_array_elements(v_participacoes) loop
    perform public.registrar_participacao(e.id, v_item, v_ids);
  end loop;

  return jsonb_build_object('inscrito_id', v_principal_id, 'ids', v_ids);
end;
$$;

create or replace function public.criar_inscricao(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.criar_inscricao_interno(p, false);
end;
$$;

create or replace function public.criar_inscricao_painel(p jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.exigir_operador();
  return public.criar_inscricao_interno(p, true);
end;
$$;

-- Troca de comida pelo painel, respeitando o limite do tipo (mesma regra do formulário).
create or replace function public.painel_definir_comida(p_inscrito_id uuid, p_tipo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_evento uuid;
begin
  perform public.exigir_operador();
  select evento_id into v_evento from public.inscritos where id = p_inscrito_id;
  if not found then perform public.erro_inscricao('inscrito_invalido'); end if;
  perform 1 from public.eventos where id = v_evento for update;
  delete from public.colaboracoes where inscrito_id = p_inscrito_id;
  perform public.registrar_colaboracao(v_evento, p_inscrito_id, p_tipo, 'inscrito');
end;
$$;

-- Ao tirar alguém de um casal ou de uma dupla, a vaga inteira é liberada;
-- em crianças/jovens a vaga só some quando fica vazia.
create or replace function public.limpar_participacao_vazia()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_categoria public.categoria_brincadeira;
begin
  select categoria into v_categoria from public.participacoes where id = old.participacao_id;
  if v_categoria in ('casais', 'pais_e_filhos') then
    delete from public.participacoes where id = old.participacao_id;
  else
    delete from public.participacoes p
    where p.id = old.participacao_id
      and not exists (select 1 from public.participantes x where x.participacao_id = p.id);
  end if;
  return old;
end;
$$;

revoke execute on function public.criar_inscricao_interno(jsonb, boolean), public.exigir_operador() from public, anon, authenticated;
revoke execute on function public.criar_inscricao_painel(jsonb), public.painel_definir_comida(uuid, text) from public, anon;
grant execute on function public.criar_inscricao_painel(jsonb), public.painel_definir_comida(uuid, text) to authenticated, service_role;
