-- Vídeo enviado no cadastro da brincadeira, além do link (YouTube etc.), que continua.
-- Pensado para clipes curtos: cada exibição sai do Storage e conta no tráfego do plano.

-- Bucket público de vídeos, no mesmo modelo do de imagens: qualquer um assiste,
-- só o administrador envia, troca ou apaga. 50 MB por arquivo (teto do plano gratuito).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', true, 52428800, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

create policy "videos: leitura publica" on storage.objects
  for select using (bucket_id = 'videos');

create policy "videos: administrador envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos' and public.perfil_atual() = 'administrador');

create policy "videos: administrador altera" on storage.objects
  for update to authenticated
  using (bucket_id = 'videos' and public.perfil_atual() = 'administrador')
  with check (bucket_id = 'videos' and public.perfil_atual() = 'administrador');

create policy "videos: administrador remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos' and public.perfil_atual() = 'administrador');

-- Caminho do arquivo no bucket de vídeos (como foto_path no de imagens).
alter table public.brincadeiras add column video_path text;

-- A lista pública passa a devolver o vídeo enviado. Mudar as colunas de retorno
-- exige recriar a função (e refazer as permissões).
drop function public.listar_brincadeiras_disponiveis(uuid);

create function public.listar_brincadeiras_disponiveis(p_evento_id uuid)
returns table (
  id uuid, nome text, foto_path text, video_url text, video_path text, regras jsonb,
  categoria public.categoria_brincadeira, formato public.formato_brincadeira,
  limite_participantes integer, vagas_restantes integer, ordem integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with ocupadas as (
    select brincadeira_id, count(*)::integer as qtd from public.participacoes group by brincadeira_id
  )
  select b.id, b.nome, b.foto_path, b.video_url, b.video_path, b.regras, b.categoria, b.formato, b.limite_participantes,
    b.limite_participantes - coalesce(o.qtd, 0) as vagas_restantes, b.ordem
  from public.brincadeiras b
  left join ocupadas o on o.brincadeira_id = b.id
  where b.evento_id = p_evento_id and b.ativo and b.limite_participantes - coalesce(o.qtd, 0) > 0
  order by b.ordem, b.nome;
$$;

revoke execute on function public.listar_brincadeiras_disponiveis(uuid) from public;
grant execute on function public.listar_brincadeiras_disponiveis(uuid) to anon, authenticated, service_role;
