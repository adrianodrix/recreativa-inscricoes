-- Lista mínima dos eventos publicados, para o sitemap do site.
-- Só slug e data de atualização: nada além do que já está na página pública.
create or replace function public.listar_eventos_publicados()
returns table (slug text, atualizado_em timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select e.slug, e.atualizado_em
  from public.eventos e
  where e.publicado
  order by e.data_evento desc;
$$;

revoke execute on function public.listar_eventos_publicados() from public;
grant execute on function public.listar_eventos_publicados() to anon, authenticated, service_role;
