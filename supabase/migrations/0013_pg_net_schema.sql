-- Correção: o pg_net expõe suas funções no schema "net", não em "extensions".
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
  perform net.http_post(
    url := v_url,
    body := '{}'::jsonb,
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_segredo, 'Content-Type', 'application/json'),
    timeout_milliseconds := 10000
  );
end;
$$;
