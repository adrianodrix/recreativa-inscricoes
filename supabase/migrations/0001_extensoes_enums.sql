-- Extensões e tipos base. unaccent normaliza nomes para a regra de unicidade.
create extension if not exists unaccent with schema extensions;

create type public.tipo_vinculo as enum ('principal', 'conjuge', 'filho');
create type public.situacao_dependente as enum ('cadastrado', 'vai_se_cadastrar', 'nao_quer_cadastrar');
create type public.tipo_comida as enum ('salgado', 'doce', 'refrigerante', 'suco');
create type public.categoria_brincadeira as enum ('casais', 'jovens', 'criancas', 'pais_e_filhos');
create type public.formato_brincadeira as enum ('individual', 'em_grupo');
create type public.papel_participante as enum ('pessoa', 'conjuge', 'filho', 'pai', 'mae', 'responsavel');
create type public.status_montagem as enum ('rascunho', 'confirmado');
create type public.tipo_aviso as enum ('confirmacao_inscricao', 'times_confirmacao', 'times_alteracao', 'times_lembrete');
create type public.status_envio as enum ('pendente', 'enviando', 'enviado', 'falhou');
create type public.perfil_usuario as enum ('analitico', 'operador', 'administrador');

-- Nome normalizado para comparação: minúsculas, sem acentos, espaços únicos.
-- Wrapper immutable sobre unaccent, padrão recomendado pela Supabase para colunas geradas.
create or replace function public.normalizar_nome(nome text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent(regexp_replace(btrim(nome), '\s+', ' ', 'g')));
$$;

-- Idade completa em uma data de referência (por padrão a data do evento).
create or replace function public.calcular_idade(nascimento date, referencia date)
returns smallint
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select extract(year from age(referencia, nascimento))::smallint;
$$;

-- Trigger genérico para atualizado_em.
create or replace function public.marcar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;
