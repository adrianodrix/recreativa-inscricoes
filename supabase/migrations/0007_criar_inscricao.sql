-- RPC atômica da inscrição. Erros: message = código, detail = JSON com contexto.

create or replace function public.erro_inscricao(p_codigo text, p_detalhe jsonb default '{}'::jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  raise exception using message = p_codigo, detail = p_detalhe::text, errcode = 'P0001';
end;
$$;

-- Nome completo (E1): 10+ caracteres, sem dígitos, pelo menos duas palavras.
create or replace function public.validar_nome_completo(p_nome text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_nome is not null
    and char_length(btrim(p_nome)) >= 10
    and p_nome !~ '\d'
    and (select count(*) from regexp_split_to_table(btrim(p_nome), '\s+') w where char_length(w) > 1) >= 2;
$$;

-- Insere uma pessoa do payload e devolve o id. p_ref identifica a pessoa nas mensagens de erro.
create or replace function public.inserir_pessoa(
  p_evento public.eventos, p_pessoa jsonb, p_vinculo public.tipo_vinculo, p_principal_id uuid, p_ref text
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_nome text := p_pessoa->>'nome_completo';
  v_nasc date;
  v_id uuid;
begin
  if not public.validar_nome_completo(v_nome) then
    perform public.erro_inscricao('nome_invalido', jsonb_build_object('ref', p_ref));
  end if;
  begin
    v_nasc := (p_pessoa->>'data_nascimento')::date;
  exception when others then
    v_nasc := null;
  end;
  if v_nasc is null or v_nasc > current_date or v_nasc < date '1900-01-01' then
    perform public.erro_inscricao('nascimento_invalido', jsonb_build_object('ref', p_ref));
  end if;
  if exists (
    select 1 from public.inscritos
    where evento_id = p_evento.id and nome_normalizado = public.normalizar_nome(v_nome)
  ) then
    perform public.erro_inscricao('nome_duplicado', jsonb_build_object('ref', p_ref, 'nome', btrim(v_nome)));
  end if;

  insert into public.inscritos (
    evento_id, nome_completo, apelido, data_nascimento, idade, casado, tem_filhos_menores,
    inscrito_principal_id, vinculo, conjuge_situacao, filhos_situacao, whatsapp
  ) values (
    p_evento.id, btrim(v_nome), nullif(btrim(coalesce(p_pessoa->>'apelido', '')), ''), v_nasc,
    public.calcular_idade(v_nasc, p_evento.data_evento),
    coalesce((p_pessoa->>'casado')::boolean, false),
    coalesce((p_pessoa->>'tem_filhos_menores')::boolean, false),
    p_principal_id, p_vinculo,
    (p_pessoa->>'conjuge_situacao')::public.situacao_dependente,
    (p_pessoa->>'filhos_situacao')::public.situacao_dependente,
    nullif(p_pessoa->>'whatsapp', '')
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- Comida/bebida (E7): só > 12 anos, uma unidade, respeitando o limite do tipo.
create or replace function public.registrar_colaboracao(p_evento_id uuid, p_inscrito_id uuid, p_tipo text, p_ref text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_tipo public.tipo_comida;
  v_idade smallint;
  v_limite integer;
  v_usado integer;
begin
  if coalesce(p_tipo, '') = '' then return; end if;
  select idade into v_idade from public.inscritos where id = p_inscrito_id;
  if v_idade <= 12 then
    perform public.erro_inscricao('comida_idade', jsonb_build_object('ref', p_ref));
  end if;
  begin
    v_tipo := p_tipo::public.tipo_comida;
  exception when others then
    perform public.erro_inscricao('comida_invalida', jsonb_build_object('ref', p_ref));
  end;
  select limite into v_limite from public.limites_comida where evento_id = p_evento_id and tipo = v_tipo;
  select count(*) into v_usado from public.colaboracoes where evento_id = p_evento_id and tipo = v_tipo;
  if v_limite is null or v_usado >= v_limite then
    perform public.erro_inscricao('estoque_comida', jsonb_build_object('ref', p_ref, 'tipo', v_tipo));
  end if;
  insert into public.colaboracoes (inscrito_id, evento_id, tipo) values (p_inscrito_id, p_evento_id, v_tipo);
end;
$$;

-- Uma participação (vaga) do payload: pessoa, casal ou dupla. p_ids mapeia ref -> id inserido.
create or replace function public.registrar_participacao(p_evento_id uuid, p_part jsonb, p_ids jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  b public.brincadeiras;
  v_tipo text := p_part->>'tipo';
  v_ocupadas integer;
  v_part_id uuid;
  v_inscrito public.inscritos;
  v_filho public.inscritos;
  v_parceiro public.inscritos;
  v_papel public.papel_participante;
  v_ctx jsonb;
begin
  select * into b from public.brincadeiras
  where id = (p_part->>'brincadeira_id')::uuid and evento_id = p_evento_id and ativo;
  if not found then
    perform public.erro_inscricao('brincadeira_invalida', jsonb_build_object('brincadeira_id', p_part->>'brincadeira_id'));
  end if;
  v_ctx := jsonb_build_object('brincadeira_id', b.id, 'nome', b.nome);

  select count(*) into v_ocupadas from public.participacoes where brincadeira_id = b.id;
  if v_ocupadas >= b.limite_participantes then
    perform public.erro_inscricao('brincadeira_lotada', v_ctx);
  end if;

  if v_tipo = 'pessoa' then
    if b.categoria not in ('criancas', 'jovens') then perform public.erro_inscricao('tipo_incompativel', v_ctx); end if;
    select * into v_inscrito from public.inscritos where id = (p_ids->>(p_part->>'pessoa'))::uuid;
    if not found or not public.categoria_elegivel(v_inscrito.idade, v_inscrito.casado, b.categoria) then
      perform public.erro_inscricao('nao_elegivel', v_ctx || jsonb_build_object('ref', p_part->>'pessoa'));
    end if;
    insert into public.participacoes (evento_id, brincadeira_id, categoria) values (p_evento_id, b.id, b.categoria) returning id into v_part_id;
    insert into public.participantes (participacao_id, brincadeira_id, inscrito_id, evento_id, papel)
    values (v_part_id, b.id, v_inscrito.id, p_evento_id, 'pessoa');

  elsif v_tipo = 'casal' then
    if b.categoria <> 'casais' then perform public.erro_inscricao('tipo_incompativel', v_ctx); end if;
    if p_ids->>'conjuge' is null then perform public.erro_inscricao('casal_sem_conjuge', v_ctx); end if;
    insert into public.participacoes (evento_id, brincadeira_id, categoria) values (p_evento_id, b.id, b.categoria) returning id into v_part_id;
    insert into public.participantes (participacao_id, brincadeira_id, inscrito_id, evento_id, papel) values
      (v_part_id, b.id, (p_ids->>'principal')::uuid, p_evento_id, 'conjuge'),
      (v_part_id, b.id, (p_ids->>'conjuge')::uuid, p_evento_id, 'conjuge');

  elsif v_tipo = 'dupla' then
    if b.categoria <> 'pais_e_filhos' then perform public.erro_inscricao('tipo_incompativel', v_ctx); end if;
    select * into v_filho from public.inscritos where id = (p_ids->>(p_part->>'filho'))::uuid and vinculo = 'filho';
    if not found then perform public.erro_inscricao('filho_invalido', v_ctx || jsonb_build_object('ref', p_part->>'filho')); end if;

    if jsonb_typeof(p_part->'parceiro') = 'string' then
      if p_part->>'parceiro' not in ('principal', 'conjuge') or p_part->>'papel' not in ('pai', 'mae') then
        perform public.erro_inscricao('parceiro_invalido', v_ctx);
      end if;
      select * into v_parceiro from public.inscritos where id = (p_ids->>(p_part->>'parceiro'))::uuid;
      if not found then perform public.erro_inscricao('parceiro_invalido', v_ctx); end if;
      v_papel := (p_part->>'papel')::public.papel_participante;
    else
      select * into v_parceiro from public.inscritos
      where id = (p_part->'parceiro'->>'responsavel_id')::uuid and evento_id = p_evento_id;
      if not found or not public.categoria_elegivel(v_parceiro.idade, v_parceiro.casado, 'jovens') then
        perform public.erro_inscricao('responsavel_invalido', v_ctx);
      end if;
      -- T14: responsável não pode ser irmão nem estar vinculado a um irmão em outra brincadeira.
      if v_parceiro.inscrito_principal_id is not distinct from v_filho.inscrito_principal_id
         or exists (
           select 1
           from public.participantes r
           join public.participantes f on f.participacao_id = r.participacao_id and f.papel = 'filho'
           join public.inscritos fi on fi.id = f.inscrito_id
           where r.inscrito_id = v_parceiro.id and r.papel = 'responsavel'
             and fi.inscrito_principal_id = v_filho.inscrito_principal_id and fi.id <> v_filho.id
         ) then
        perform public.erro_inscricao('responsavel_irmao', v_ctx || jsonb_build_object('ref', p_part->>'filho'));
      end if;
      v_papel := 'responsavel';
    end if;

    insert into public.participacoes (evento_id, brincadeira_id, categoria) values (p_evento_id, b.id, b.categoria) returning id into v_part_id;
    insert into public.participantes (participacao_id, brincadeira_id, inscrito_id, evento_id, papel) values
      (v_part_id, b.id, v_filho.id, p_evento_id, 'filho'),
      (v_part_id, b.id, v_parceiro.id, p_evento_id, v_papel);
  else
    perform public.erro_inscricao('tipo_invalido', v_ctx);
  end if;
exception when unique_violation then
  perform public.erro_inscricao('parceiro_ocupado', v_ctx || jsonb_build_object('ref', coalesce(p_part->>'filho', p_part->>'pessoa', 'principal')));
end;
$$;

-- Ponto de entrada público. Serializa as inscrições do evento com lock na linha do evento.
create or replace function public.criar_inscricao(p jsonb)
returns jsonb
language plpgsql
security definer
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
  if public.motivo_fechado(e, v_total) is not null then
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

revoke execute on function
  public.erro_inscricao(text, jsonb),
  public.validar_nome_completo(text),
  public.inserir_pessoa(public.eventos, jsonb, public.tipo_vinculo, uuid, text),
  public.registrar_colaboracao(uuid, uuid, text, text),
  public.registrar_participacao(uuid, jsonb, jsonb)
from public, anon, authenticated;

revoke execute on function public.criar_inscricao(jsonb) from public;
grant execute on function public.criar_inscricao(jsonb) to anon, authenticated, service_role;
