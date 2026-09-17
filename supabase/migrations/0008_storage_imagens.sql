-- Bucket público de imagens: capas de evento, fotos de brincadeiras e imagens de times.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagens', 'imagens', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "imagens: leitura publica" on storage.objects
  for select using (bucket_id = 'imagens');

create policy "imagens: administrador envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'imagens' and public.perfil_atual() = 'administrador');

create policy "imagens: administrador altera" on storage.objects
  for update to authenticated
  using (bucket_id = 'imagens' and public.perfil_atual() = 'administrador')
  with check (bucket_id = 'imagens' and public.perfil_atual() = 'administrador');

create policy "imagens: administrador remove" on storage.objects
  for delete to authenticated
  using (bucket_id = 'imagens' and public.perfil_atual() = 'administrador');
