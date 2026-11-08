-- Quem já foi inscrito (por exemplo, o cônjuge cadastrado pelo outro) precisa de
-- uma saída clara no formulário, e não só de um "nome já inscrito".

-- Situação de um nome no evento: 'livre', 'principal' (a pessoa fez a própria
-- inscrição) ou 'familiar' (foi cadastrada como cônjuge ou filho). A RPC é pública,
-- então não devolve quem inscreveu nem dado nenhum da pessoa.
create or replace function public.consultar_nome_inscrito(p_evento_id uuid, p_nome text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select case when i.vinculo = 'principal' then 'principal' else 'familiar' end
      from public.inscritos i
      where i.evento_id = p_evento_id and i.nome_normalizado = public.normalizar_nome(p_nome)
    ),
    'livre'
  );
$$;

revoke execute on function public.consultar_nome_inscrito(uuid, text) from public;
grant execute on function public.consultar_nome_inscrito(uuid, text) to anon, authenticated, service_role;

-- Substituída pela consulta acima. Um front antigo que ainda chame esta função
-- trata a falha como "nome livre", e a criar_inscricao continua barrando duplicados.
drop function public.verificar_nome_disponivel(uuid, text);

-- O formulário passa a receber os contatos da organização, para quem já está
-- inscrito ou tem um homônimo saber com quem falar. São os mesmos contatos que a
-- página inicial já mostra ao público.
create or replace function public.obter_evento_publico(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  e public.eventos;
  v_total integer;
begin
  select * into e from public.eventos where slug = p_slug and publicado;
  if not found then return null; end if;
  v_total := public.total_inscritos(e.id);
  return public.evento_publico_json(e, v_total) || jsonb_build_object(
    'comida_disponivel', public.comida_disponivel(e.id),
    'contatos', (
      select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome, 'whatsapp', c.whatsapp)
        order by c.ordem, c.criado_em), '[]'::jsonb)
      from public.contatos c where c.evento_id = e.id
    )
  );
end;
$$;
